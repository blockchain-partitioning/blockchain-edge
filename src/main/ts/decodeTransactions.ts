import * as Path from "path";
import * as Grpc from "grpc";

const protopath = Path.join(removeLastDirectoryPartOf(require.resolve('fabric-client')), "lib", "protos", "peer", "chaincode.proto");
const chaincodeProtos = Grpc.load(protopath).protos;

function removeLastDirectoryPartOf(path) {
    let the_arr = path.split(Path.sep);
    the_arr.pop();
    return (the_arr.join(Path.sep));
}

function decodeTransactions(transactions: any, channelName: string) {
    return transactions.map((transaction) => {
        const channel_id = transaction.payload.header.channel_header.channel_id;
        if (channel_id === channelName && transactionPayloadIsEndorsementTransaction(transaction.payload.data)) {
            transaction.payload.data.actions = transaction.payload.data.actions.map((ledgerAction) => {
                ledgerAction.payload.chaincode_proposal_payload.input = decodeChaincodeInvocationSpec(ledgerAction.payload.chaincode_proposal_payload.input);
                return ledgerAction;
            });
        }
        return transaction;
    });
}

function transactionPayloadIsEndorsementTransaction(payloadData) {
    return (payloadData.actions) ? true : false;
}

function decodeChaincodeInvocationSpec(chaincodeInvocationSpec: Buffer): any {
    let chaincode_invocation_spec: any = {};
    if (!chaincodeInvocationSpec) {
        return chaincode_invocation_spec;
    }
    let proto_chaincode_invocation_spec = chaincodeProtos.ChaincodeInvocationSpec.decode(chaincodeInvocationSpec);
    chaincode_invocation_spec.chaincode_spec = decodeChaincodeSpec(proto_chaincode_invocation_spec.getChaincodeSpec());

    return chaincode_invocation_spec;
}

function decodeChaincodeSpec(proto_chaincode_spec): any {
    let chaincode_spec: any = {};
    if (!proto_chaincode_spec) {
        return chaincode_spec;
    }
    chaincode_spec.type = proto_chaincode_spec.getType();
    chaincode_spec.chaincode_id = decodeChaincodeID(proto_chaincode_spec.getChaincodeId());
    chaincode_spec.input = decodeChaincodeInput(proto_chaincode_spec.getInput());

    return chaincode_spec;
}

function decodeChaincodeID(proto_chaincode_id): any {
    let chaincode_id: any = {};
    if (!proto_chaincode_id) {
        return chaincode_id;
    }
    chaincode_id.path = proto_chaincode_id.getPath();
    chaincode_id.name = proto_chaincode_id.getName();
    chaincode_id.version = proto_chaincode_id.getVersion();

    return chaincode_id;
}

function decodeChaincodeInput(proto_chaincode_input): any {
    let chaincode_input: any = {};
    if (!proto_chaincode_input) {
        return chaincode_input;
    }
    chaincode_input.args = proto_chaincode_input.getArgs();

    return chaincode_input;
}

export {
    decodeTransactions
}