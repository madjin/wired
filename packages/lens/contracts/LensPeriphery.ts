/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export declare namespace DataTypes {
  export type EIP712SignatureStruct = {
    v: PromiseOrValue<BigNumberish>;
    r: PromiseOrValue<BytesLike>;
    s: PromiseOrValue<BytesLike>;
    deadline: PromiseOrValue<BigNumberish>;
  };

  export type EIP712SignatureStructOutput = [
    number,
    string,
    string,
    BigNumber
  ] & { v: number; r: string; s: string; deadline: BigNumber };

  export type SetProfileMetadataWithSigDataStruct = {
    profileId: PromiseOrValue<BigNumberish>;
    metadata: PromiseOrValue<string>;
    sig: DataTypes.EIP712SignatureStruct;
  };

  export type SetProfileMetadataWithSigDataStructOutput = [
    BigNumber,
    string,
    DataTypes.EIP712SignatureStructOutput
  ] & {
    profileId: BigNumber;
    metadata: string;
    sig: DataTypes.EIP712SignatureStructOutput;
  };

  export type ToggleFollowWithSigDataStruct = {
    follower: PromiseOrValue<string>;
    profileIds: PromiseOrValue<BigNumberish>[];
    enables: PromiseOrValue<boolean>[];
    sig: DataTypes.EIP712SignatureStruct;
  };

  export type ToggleFollowWithSigDataStructOutput = [
    string,
    BigNumber[],
    boolean[],
    DataTypes.EIP712SignatureStructOutput
  ] & {
    follower: string;
    profileIds: BigNumber[];
    enables: boolean[];
    sig: DataTypes.EIP712SignatureStructOutput;
  };
}

export interface LensPeripheryInterface extends utils.Interface {
  functions: {
    "HUB()": FunctionFragment;
    "NAME()": FunctionFragment;
    "getProfileMetadataURI(uint256)": FunctionFragment;
    "setProfileMetadataURI(uint256,string)": FunctionFragment;
    "setProfileMetadataURIWithSig((uint256,string,(uint8,bytes32,bytes32,uint256)))": FunctionFragment;
    "sigNonces(address)": FunctionFragment;
    "toggleFollow(uint256[],bool[])": FunctionFragment;
    "toggleFollowWithSig((address,uint256[],bool[],(uint8,bytes32,bytes32,uint256)))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "HUB"
      | "NAME"
      | "getProfileMetadataURI"
      | "setProfileMetadataURI"
      | "setProfileMetadataURIWithSig"
      | "sigNonces"
      | "toggleFollow"
      | "toggleFollowWithSig"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "HUB", values?: undefined): string;
  encodeFunctionData(functionFragment: "NAME", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getProfileMetadataURI",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setProfileMetadataURI",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setProfileMetadataURIWithSig",
    values: [DataTypes.SetProfileMetadataWithSigDataStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "sigNonces",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "toggleFollow",
    values: [PromiseOrValue<BigNumberish>[], PromiseOrValue<boolean>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "toggleFollowWithSig",
    values: [DataTypes.ToggleFollowWithSigDataStruct]
  ): string;

  decodeFunctionResult(functionFragment: "HUB", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "NAME", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getProfileMetadataURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProfileMetadataURI",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProfileMetadataURIWithSig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sigNonces", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "toggleFollow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "toggleFollowWithSig",
    data: BytesLike
  ): Result;

  events: {};
}

export interface LensPeriphery extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LensPeripheryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    HUB(overrides?: CallOverrides): Promise<[string]>;

    NAME(overrides?: CallOverrides): Promise<[string]>;

    getProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    setProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      metadata: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setProfileMetadataURIWithSig(
      vars: DataTypes.SetProfileMetadataWithSigDataStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    sigNonces(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    toggleFollow(
      profileIds: PromiseOrValue<BigNumberish>[],
      enables: PromiseOrValue<boolean>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    toggleFollowWithSig(
      vars: DataTypes.ToggleFollowWithSigDataStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  HUB(overrides?: CallOverrides): Promise<string>;

  NAME(overrides?: CallOverrides): Promise<string>;

  getProfileMetadataURI(
    profileId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  setProfileMetadataURI(
    profileId: PromiseOrValue<BigNumberish>,
    metadata: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setProfileMetadataURIWithSig(
    vars: DataTypes.SetProfileMetadataWithSigDataStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  sigNonces(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  toggleFollow(
    profileIds: PromiseOrValue<BigNumberish>[],
    enables: PromiseOrValue<boolean>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  toggleFollowWithSig(
    vars: DataTypes.ToggleFollowWithSigDataStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    HUB(overrides?: CallOverrides): Promise<string>;

    NAME(overrides?: CallOverrides): Promise<string>;

    getProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    setProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      metadata: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setProfileMetadataURIWithSig(
      vars: DataTypes.SetProfileMetadataWithSigDataStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    sigNonces(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    toggleFollow(
      profileIds: PromiseOrValue<BigNumberish>[],
      enables: PromiseOrValue<boolean>[],
      overrides?: CallOverrides
    ): Promise<void>;

    toggleFollowWithSig(
      vars: DataTypes.ToggleFollowWithSigDataStruct,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    HUB(overrides?: CallOverrides): Promise<BigNumber>;

    NAME(overrides?: CallOverrides): Promise<BigNumber>;

    getProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      metadata: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setProfileMetadataURIWithSig(
      vars: DataTypes.SetProfileMetadataWithSigDataStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    sigNonces(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    toggleFollow(
      profileIds: PromiseOrValue<BigNumberish>[],
      enables: PromiseOrValue<boolean>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    toggleFollowWithSig(
      vars: DataTypes.ToggleFollowWithSigDataStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    HUB(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    NAME(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setProfileMetadataURI(
      profileId: PromiseOrValue<BigNumberish>,
      metadata: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setProfileMetadataURIWithSig(
      vars: DataTypes.SetProfileMetadataWithSigDataStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    sigNonces(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    toggleFollow(
      profileIds: PromiseOrValue<BigNumberish>[],
      enables: PromiseOrValue<boolean>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    toggleFollowWithSig(
      vars: DataTypes.ToggleFollowWithSigDataStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}