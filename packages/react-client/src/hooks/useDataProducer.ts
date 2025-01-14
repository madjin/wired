import { DataProducer } from "mediasoup-client/lib/DataProducer";
import { Transport } from "mediasoup-client/lib/Transport";
import { useEffect, useState } from "react";

export function useDataProducer(transport: Transport | null) {
  const [dataProducer, setDataProducer] = useState<DataProducer | null>(null);

  useEffect(() => {
    if (!transport) return;

    transport.produceData({ ordered: false, maxRetransmits: 0 }).then(setDataProducer);
  }, [transport]);

  useEffect(() => {
    if (!dataProducer) return;

    return () => {
      dataProducer.close();
    };
  }, [dataProducer]);

  return dataProducer;
}
