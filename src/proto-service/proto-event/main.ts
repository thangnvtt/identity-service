// And the protobufjs library
import * as protobuf from 'protobufjs'

export enum MainEventType {
	IDENTITY_USER = 'IDENTITY_USER',
}

export enum MainEventState {
	CREATED = 'CREATED',
}

export enum CommonState {
	INIT = 'INIT',
	CREATED = 'CREATED',
	UPDATED = 'UPDATED',
}

export enum MetaChain {
	CHT = 'CHT',
	BTC = 'BTC',
	ETH = 'ETH',
	BSC = 'BSC',
}
// MainEvent
const mainEventRoot = protobuf.loadSync('src/proto-service/proto-event/main_event.proto')
export const MainEvent = mainEventRoot.lookupType('model.MainEvent')

// User Event
const userEventRoot = protobuf.loadSync('src/proto-service/proto-event/user_identity_event.proto')
export const UserIdentityUserEvent = userEventRoot.lookupType('model.UserIdentityUserEvent')

// Meta Wallet Event
const metaWalletEventRoot = protobuf.loadSync('src/proto-service/proto-event/meta_wallet_event.proto')
export const MetaWalletEvent = metaWalletEventRoot.lookupType('model.MetaWallet')
