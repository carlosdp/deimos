import { Address, BigInt } from '@graphprotocol/graph-ts';

import {
  ProposalCanceled as ProposalCanceledEvent,
  ProposalCreated as ProposalCreatedEvent,
  ProposalExecuted as ProposalExecutedEvent,
  ProposalQueued as ProposalQueuedEvent,
  QuorumNumeratorUpdated as QuorumNumeratorUpdatedEvent,
  TimelockChange as TimelockChangeEvent,
  VoteCast as VoteCastEvent,
} from '../generated/Contract/Contract';
import {
  Account,
  Governor,
  Proposal,
  ProposalEvent,
  Vote,
  QuorumNumeratorUpdated,
  TimelockChange,
} from '../generated/schema';

function getAccount(address: Address): Account {
  let account = Account.load(address.toHex());

  if (!account) {
    account = new Account(address.toHex());
    account.save();
  }

  return account;
}

function getGovernor(address: Address): Governor {
  let governor = Governor.load(address.toHex());

  if (!governor) {
    governor = new Governor(address.toHex());
    governor.save();
  }

  return governor;
}

// eslint-disable-next-line
function getProposal(governorId: Address, proposalId: BigInt): Proposal {
  const id = `${governorId.toHexString()}:${proposalId.toHexString()}`;
  let proposal = Proposal.load(id);

  if (!proposal) {
    proposal = new Proposal(id);
    proposal.save();
  }

  return proposal;
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
  getGovernor(event.address);
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'CANCELLED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toHexString();
  entity.createdAt = event.block.timestamp;
  entity.save();

  const proposal = getProposal(event.address, event.params.proposalId);

  if (proposal) {
    proposal.status = 'CANCELLED';
    proposal.save();
  }
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'CREATED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toHexString();
  entity.createdAt = event.block.timestamp;
  entity.save();

  const proposal = new Proposal(`${event.address.toHexString()}:${event.params.proposalId.toHexString()}`);
  proposal.proposalId = event.params.proposalId;
  proposal.governor = getGovernor(event.address).id;
  proposal.proposer = getAccount(event.params.proposer).id;
  proposal.targets = event.params.targets.map<string>(t => t.toHex());
  proposal.values = event.params.values;
  proposal.signatures = event.params.signatures;
  proposal.calldatas = event.params.calldatas;
  proposal.startBlock = event.params.startBlock;
  proposal.endBlock = event.params.endBlock;
  proposal.description = event.params.description;
  proposal.createdAt = event.block.timestamp;

  proposal.status = 'CREATED';
  proposal.votesForCount = BigInt.zero();
  proposal.votesAgainstCount = BigInt.zero();

  proposal.save();
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
  getGovernor(event.address);
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'EXECUTED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toHexString();
  entity.createdAt = event.block.timestamp;
  entity.save();

  const proposal = getProposal(event.address, event.params.proposalId);

  if (proposal) {
    proposal.status = 'EXECUTED';
    proposal.save();
  }
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
  getGovernor(event.address);
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'QUEUED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toHexString();
  entity.eta = event.params.eta;
  entity.createdAt = event.block.timestamp;
  entity.save();

  const proposal = getProposal(event.address, event.params.proposalId);

  if (proposal) {
    proposal.status = 'QUEUED';
    proposal.save();
  }
}

export function handleQuorumNumeratorUpdated(event: QuorumNumeratorUpdatedEvent): void {
  getGovernor(event.address);
  const entity = new QuorumNumeratorUpdated(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.oldQuorumNumerator = event.params.oldQuorumNumerator;
  entity.newQuorumNumerator = event.params.newQuorumNumerator;
  entity.createdAt = event.block.timestamp;
  entity.save();
}

export function handleTimelockChange(event: TimelockChangeEvent): void {
  getGovernor(event.address);
  const entity = new TimelockChange(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.oldTimelock = event.params.oldTimelock;
  entity.newTimelock = event.params.newTimelock;
  entity.createdAt = event.block.timestamp;
  entity.save();
}

export function handleVoteCast(event: VoteCastEvent): void {
  getGovernor(event.address);
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'VOTE_CAST';
  entity.from = getAccount(event.transaction.from).id;
  const voterAccount = getAccount(event.params.voter);
  entity.voter = voterAccount.id;
  entity.proposal = event.params.proposalId.toHexString();
  entity.support = event.params.support;
  entity.weight = event.params.weight;
  entity.reason = event.params.reason;
  entity.createdAt = event.block.timestamp;
  entity.save();

  const proposal = getProposal(event.address, event.params.proposalId);

  if (proposal) {
    if (entity.support) {
      proposal.votesForCount = proposal.votesForCount.plus(event.params.weight);
    } else {
      proposal.votesAgainstCount = proposal.votesAgainstCount.plus(event.params.weight);
    }

    proposal.save();

    const vote = new Vote(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
    vote.voter = voterAccount.id;
    vote.proposal = event.params.proposalId.toHexString();
    vote.support = event.params.support === 1;
    vote.weight = event.params.weight;
    vote.reason = event.params.reason;
    vote.createdAt = event.block.timestamp;
    vote.save();
  }
}
