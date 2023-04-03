import {
  Extension,
  Format,
  PropertyType,
  ReaderContext,
  WriterContext,
} from "@gltf-transform/core";

import { EXTENSION_NAME } from "../constants";
import { AudioData } from "./AudioData";
import { AudioEmitter } from "./AudioEmitter";
import { AudioSource } from "./AudioSource";
import { SceneAudioEmitters } from "./SceneAudioEmitters";
import {
  AudioDataDef,
  AudioEmitterDef,
  AudioExtensionDef,
  audioExtensionSchema,
  AudioSourceDef,
  nodeAudioSchema,
  sceneAudioSchema,
} from "./schemas";

/**
 * Implementation of the {@link https://github.com/omigroup/gltf-extensions/tree/main/extensions/2.0/KHR_audio KHR_audio} extension.
 *
 * @group KHR_audio
 */
export class AudioExtension extends Extension {
  static override readonly EXTENSION_NAME = EXTENSION_NAME.Audio;
  override readonly extensionName = EXTENSION_NAME.Audio;
  override prewriteTypes = [PropertyType.BUFFER];

  createSceneAudioEmitters() {
    return new SceneAudioEmitters(this.document.getGraph());
  }

  createAudioData() {
    return new AudioData(this.document.getGraph());
  }

  createAudioSource() {
    return new AudioSource(this.document.getGraph());
  }

  createAudioEmitter() {
    return new AudioEmitter(this.document.getGraph());
  }

  read(context: ReaderContext) {
    const { json, resources } = context.jsonDoc;

    if (!json.extensions || !json.extensions[this.extensionName]) return this;

    const rootDef = audioExtensionSchema.parse(json.extensions[this.extensionName]);

    const audioDatas = rootDef.audio.map((audioDef) => {
      const audioData = this.createAudioData();

      if (audioDef.uri !== undefined) {
        audioData.setURI(audioDef.uri);
      } else if (audioDef.bufferView !== undefined) {
        if (!json.bufferViews) throw new Error("BufferViews not found");
        if (!json.buffers) throw new Error("Buffers not found");

        const bufferViewDef = json.bufferViews[audioDef.bufferView];
        if (!bufferViewDef) throw new Error("BufferView not found");

        const bufferDef = json.buffers[bufferViewDef.buffer];
        if (!bufferDef) throw new Error("Buffer not found");

        const bufferData = bufferDef.uri ? resources[bufferDef.uri] : resources["@glb.bin"];
        if (!bufferData) throw new Error("Buffer data not found");

        const byteOffset = bufferViewDef.byteOffset || 0;
        const byteLength = bufferViewDef.byteLength;
        const data = bufferData.slice(byteOffset, byteOffset + byteLength);
        audioData.setData(data);
      }

      return audioData;
    });

    const audioSources = rootDef.sources.map((sourceDef) => {
      const source = this.createAudioSource();
      source.setAutoPlay(sourceDef.autoPlay);
      source.setGain(sourceDef.gain);
      source.setLoop(sourceDef.loop);
      source.setName(sourceDef.name);

      const audio = audioDatas[sourceDef.audio];
      if (!audio) throw new Error("Audio not found");

      source.setAudio(audio);

      return source;
    });

    const audioEmitters = rootDef.emitters.map((emitterDef) => {
      const emitter = this.createAudioEmitter();
      emitter.setType(emitterDef.type);
      emitter.setGain(emitterDef.gain);

      emitterDef.sources.map((sourceDef) => {
        const source = audioSources[sourceDef];
        if (!source) throw new Error("Audio source not found");

        emitter.addSource(source);
      });

      if (emitterDef.positional) emitter.setPositional(emitterDef.positional);

      return emitter;
    });

    const sceneDefs = json.scenes || [];

    sceneDefs.forEach((sceneDef, sceneIndex) => {
      if (!sceneDef.extensions || !sceneDef.extensions[this.extensionName]) return;

      const sceneEmitterDef = sceneAudioSchema.parse(sceneDef.extensions[this.extensionName]);
      const sceneAudioEmitters = this.createSceneAudioEmitters();

      for (const emitterIndex of sceneEmitterDef.emitters) {
        const audioEmitter = audioEmitters[emitterIndex];
        if (!audioEmitter) throw new Error("Audio emitter not found");

        sceneAudioEmitters.addEmitter(audioEmitter);
      }

      context.scenes[sceneIndex]?.setExtension(this.extensionName, sceneAudioEmitters);
    });

    const nodeDefs = json.nodes || [];

    nodeDefs.forEach((nodeDef, nodeIndex) => {
      if (!nodeDef.extensions || !nodeDef.extensions[this.extensionName]) return;

      const nodeEmitterDef = nodeAudioSchema.parse(nodeDef.extensions[this.extensionName]);

      const audioEmitter = audioEmitters[nodeEmitterDef.emitter];
      if (!audioEmitter) throw new Error("Audio emitter not found");

      context.nodes[nodeIndex]?.setExtension(this.extensionName, audioEmitter);
    });

    return this;
  }

  #audioDataUris = new Map<AudioData, string>();

  override prewrite(context: WriterContext) {
    this.#audioDataUris.clear();

    let audioFileCounter = 0;

    this.listAudioDatas().forEach((audioData) => {
      const data = audioData.getData();

      if (data) {
        if (context.options.format === Format.GLB) {
          const glbBuffer = this.document.getRoot().listBuffers()[0];
          if (!glbBuffer) throw new Error("GLB buffer not found");

          const bufferViews = context.otherBufferViews.get(glbBuffer) || [];
          bufferViews.push(data);
          context.otherBufferViews.set(glbBuffer, bufferViews);
        } else {
          const uri = audioData.getURI() || `audio_${audioFileCounter++}.mp3`;
          context.jsonDoc.resources[uri] = data;
          this.#audioDataUris.set(audioData, uri);
        }
      }
    });

    return this;
  }

  write(context: WriterContext) {
    const rootDef: AudioExtensionDef = {
      audio: [],
      sources: [],
      emitters: [],
    };

    const audioDataIndexMap = new Map<AudioData, number>();
    const audioSourceIndexMap = new Map<AudioSource, number>();
    const audioEmitterIndexMap = new Map<AudioEmitter, number>();

    this.listAudioDatas().forEach((audioData) => {
      const audioDataDef: AudioDataDef = {
        uri: audioData.getURI(),
        mimeType: audioData.getMimeType(),
      };

      const data = audioData.getData();

      if (data) {
        if (context.options.format === Format.GLB) {
          audioDataDef.mimeType = "audio/mpeg";
          audioDataDef.bufferView = context.otherBufferViewsIndexMap.get(data);
        } else {
          audioDataDef.uri = this.#audioDataUris.get(audioData);
        }
      }

      audioDataIndexMap.set(audioData, rootDef.audio.length);
      rootDef.audio.push(audioDataDef);
    });

    this.listAudioSources().forEach((audioSource) => {
      const audioData = audioSource.getAudio();
      if (!audioData) throw new Error("Audio data not found");

      const audioDataIndex = audioDataIndexMap.get(audioData);
      if (audioDataIndex === undefined) throw new Error("Audio data index not found");

      const audioSourceDef: AudioSourceDef = {
        autoPlay: audioSource.getAutoPlay(),
        gain: audioSource.getGain(),
        loop: audioSource.getLoop(),
        name: audioSource.getName(),
        audio: audioDataIndex,
      };

      audioSourceIndexMap.set(audioSource, rootDef.sources.length);
      rootDef.sources.push(audioSourceDef);
    });

    this.listAudioEmitters().forEach((audioEmitter) => {
      const audioEmitterDef: AudioEmitterDef = {
        name: audioEmitter.getName(),
        type: audioEmitter.getType(),
        gain: audioEmitter.getGain(),
        sources: [],
      };

      audioEmitter.listSources().forEach((audioSource) => {
        const index = audioSourceIndexMap.get(audioSource);
        if (index === undefined) throw new Error("Audio source index not found");

        audioEmitterDef.sources.push(index);
      });

      if (audioEmitter.getPositional()) audioEmitterDef.positional = audioEmitter.getPositional();

      audioEmitterIndexMap.set(audioEmitter, rootDef.emitters.length);
      rootDef.emitters.push(audioEmitterDef);
    });

    this.document
      .getRoot()
      .listScenes()
      .forEach((scene) => {
        const audioEmitters = scene.getExtension<SceneAudioEmitters>(this.extensionName);

        if (audioEmitters) {
          const sceneIndex = context.sceneIndexMap.get(scene);
          if (sceneIndex === undefined) throw new Error("Scene index not found");
          if (!context.jsonDoc.json.scenes) throw new Error("Scenes not found");

          const sceneDef = context.jsonDoc.json.scenes[sceneIndex];
          if (!sceneDef) throw new Error("Scene not found");

          sceneDef.extensions = sceneDef.extensions || {};

          const emitterIndices = audioEmitters
            .listEmitters()
            .map((audioEmitter) => audioEmitterIndexMap.get(audioEmitter));

          sceneDef.extensions[this.extensionName] = {
            emitters: emitterIndices,
          };
        }
      });

    this.document
      .getRoot()
      .listNodes()
      .forEach((node) => {
        const audioEmitter = node.getExtension<AudioEmitter>(this.extensionName);

        if (audioEmitter) {
          const nodeIndex = context.nodeIndexMap.get(node);
          if (nodeIndex === undefined) throw new Error("Node index not found");
          if (!context.jsonDoc.json.nodes) throw new Error("Nodes not found");

          const nodeDef = context.jsonDoc.json.nodes[nodeIndex];
          if (!nodeDef) throw new Error("Node not found");

          nodeDef.extensions = nodeDef.extensions || {};
          nodeDef.extensions[this.extensionName] = {
            emitter: audioEmitterIndexMap.get(audioEmitter),
          };
        }
      });

    if (rootDef.audio.length || rootDef.sources.length || rootDef.emitters.length) {
      context.jsonDoc.json.extensions = context.jsonDoc.json.extensions || {};
      context.jsonDoc.json.extensions[this.extensionName] = rootDef;
    }

    return this;
  }

  listAudioDatas(): AudioData[] {
    return this.listProperties().filter(
      (property): property is AudioData => property instanceof AudioData
    );
  }

  listAudioSources(): AudioSource[] {
    return this.listProperties().filter(
      (property): property is AudioSource => property instanceof AudioSource
    );
  }

  listAudioEmitters(): AudioEmitter[] {
    return this.listProperties().filter(
      (property): property is AudioEmitter => property instanceof AudioEmitter
    );
  }
}
