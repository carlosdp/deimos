import { Address, BigInt } from '@graphprotocol/graph-ts';

import {
  RefundPoolCreated,
  RefundPoolClosed,
  RefundPoolBalanceAdded,
  GasRefunded,
} from '../generated/GovernorGasRefundProxy/GovernorGasRefundProxy';
import { Account, Governor, Proposal, RefundPool, Refund } from '../generated/schema';

function getAccount(address: Address): Account {
  let account = Account.load(address.toHex());

  if (!account) {
    account = new Account(address.toHex());
    account.save();
  }

  return account;
}

// eslint-disable-next-line
function getProposal(proposalId: BigInt): Proposal {
  let proposal = Proposal.load(proposalId.toHexString());

  if (!proposal) {
    proposal = new Proposal(proposalId.toHexString());
    proposal.save();
  }

  return proposal;
}

function getGovernor(governorId: Address): Governor {
  let governor = Governor.load(governorId.toHexString());

  if (!governor) {
    governor = new Governor(governorId.toHexString());
    governor.save();
  }

  return governor;
}

export function handleRefundPoolCreated(event: RefundPoolCreated): void {
  const pool = new RefundPool(event.params.poolId.toHexString());
  pool.governor = getGovernor(event.params.governor).id;
  pool.owner = getAccount(event.params.owner).id;
  pool.balance = event.params.balance;
  pool.closed = false;

  pool.save();
}

export function handleRefundPoolClosed(event: RefundPoolClosed): void {
  const pool = RefundPool.load(event.params.poolId.toHexString());

  if (!pool) {
    throw new Error('RefundPool not found');
  }

  pool.balance = BigInt.zero();
  pool.closed = true;

  pool.save();
}

export function handleRefundPoolBalanceAdded(event: RefundPoolBalanceAdded): void {
  const pool = RefundPool.load(event.params.poolId.toHexString());

  if (!pool) {
    throw new Error('RefundPool not found');
  }

  pool.balance = pool.balance.plus(event.params.amountAdded);

  pool.save();
}

export function handleGasRefunded(event: GasRefunded): void {
  const pool = RefundPool.load(event.params.poolId.toHexString());

  if (!pool) {
    throw new Error('RefundPool not found');
  }

  const refund = new Refund(
    `${event.params.governor.toHexString()}-${event.params.proposalId.toHexString()}-${event.params.voter.toHexString()}`
  );
  refund.pool = event.params.poolId.toHexString();
  refund.proposal = getProposal(event.params.proposalId).id;
  refund.voter = getAccount(event.params.voter).id;

  refund.save();
}
