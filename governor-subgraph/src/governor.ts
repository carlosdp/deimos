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
import { Account, Proposal, ProposalEvent, Vote, QuorumNumeratorUpdated, TimelockChange } from '../generated/schema';

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
  let proposal = Proposal.load(proposalId.toString());

  if (!proposal) {
    proposal = new Proposal(proposalId.toString());
    proposal.save();
  }

  return proposal;
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'CANCELLED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toString();
  entity.save();

  const proposal = getProposal(event.params.proposalId);

  if (proposal) {
    proposal.status = 'CANCELLED';
    proposal.save();
  }
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'CREATED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toString();
  entity.save();

  const proposal = new Proposal(event.params.proposalId.toString());
  proposal.proposalId = event.params.proposalId;
  proposal.proposer = getAccount(event.params.proposer).id;
  proposal.targets = event.params.targets.map<string>(t => t.toHex());
  proposal.values = event.params.values;
  proposal.signatures = event.params.signatures;
  proposal.calldatas = event.params.calldatas;
  proposal.startBlock = event.params.startBlock;
  proposal.endBlock = event.params.endBlock;
  proposal.description = event.params.description;

  proposal.status = 'IN_PROGRESS';
  proposal.votesForCount = BigInt.zero();
  proposal.votesAgainstCount = BigInt.zero();

  proposal.save();
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'EXECUTED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toString();
  entity.save();

  const proposal = Proposal.load(event.params.proposalId.toString());

  if (proposal) {
    proposal.status = 'EXECUTED';
    proposal.save();
  }
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'QUEUED';
  entity.from = getAccount(event.transaction.from).id;
  entity.proposal = event.params.proposalId.toString();
  entity.eta = event.params.eta;
  entity.save();

  const proposal = Proposal.load(event.params.proposalId.toString());

  if (proposal) {
    proposal.status = 'QUEUED';
    proposal.save();
  }
}

export function handleQuorumNumeratorUpdated(event: QuorumNumeratorUpdatedEvent): void {
  const entity = new QuorumNumeratorUpdated(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.oldQuorumNumerator = event.params.oldQuorumNumerator;
  entity.newQuorumNumerator = event.params.newQuorumNumerator;
  entity.save();
}

export function handleTimelockChange(event: TimelockChangeEvent): void {
  const entity = new TimelockChange(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.oldTimelock = event.params.oldTimelock;
  entity.newTimelock = event.params.newTimelock;
  entity.save();
}

export function handleVoteCast(event: VoteCastEvent): void {
  const entity = new ProposalEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.type = 'VOTE_CAST';
  entity.from = getAccount(event.transaction.from).id;
  const voterAccount = getAccount(event.params.voter);
  entity.voter = voterAccount.id;
  entity.proposal = event.params.proposalId.toString();
  entity.support = event.params.support;
  entity.weight = event.params.weight;
  entity.reason = event.params.reason;
  entity.save();

  const proposal = Proposal.load(event.params.proposalId.toString());

  if (proposal) {
    if (entity.support) {
      proposal.votesForCount = proposal.votesForCount.plus(event.params.weight);
    } else {
      proposal.votesAgainstCount = proposal.votesAgainstCount.plus(event.params.weight);
    }

    proposal.save();

    const vote = new Vote(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
    vote.voter = voterAccount.id;
    vote.proposal = event.params.proposalId.toString();
    vote.support = event.params.support === 1;
    vote.weight = event.params.weight;
    vote.reason = event.params.reason;
    vote.save();
  }
}
