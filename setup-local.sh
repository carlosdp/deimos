#!/bin/bash

PRIV_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

export GOVERNOR_START_BLOCK=0
export GOVERNOR_PROXY_START_BLOCK=0
export GOVERNOR_ADDRESS="0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"
export GOVERNOR_PROXY_ADDRESS="0xfd3bc22cb0889db8eff357e41908c46a088f3805"
export TOKEN_ADDRESS="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

docker-compose up --force-recreate -d --renew-anon-volumes && \
# setup governor and refund proxy
(cd contracts && forge script script/DeployLocalEnvironment.s.sol --broadcast --rpc-url=http://localhost:8545 --private-key=$PRIV_KEY -vvv ) && \
if [[ ! -z $DEV_ACCOUNT ]]; then
  cast send --value "1 ether" --private-key=$PRIV_KEY $DEV_ACCOUNT
  cast rpc anvil_impersonateAccount $DEV_ACCOUNT && \
  cast send --from $DEV_ACCOUNT $TOKEN_ADDRESS "mint(uint256 amount)" "1 ether" && \
  cast send --from $DEV_ACCOUNT $TOKEN_ADDRESS "delegate(address account)" $DEV_ACCOUNT && \
  cast rpc anvil_stopImpersonatingAccount $DEV_ACCOUNT
fi && \
# Advance a block so we can make a proposal
cast rpc anvil_mine && \
cast send --private-key $PRIV_KEY $GOVERNOR_ADDRESS "propose(address[],uint256[],bytes[],string)" "[$GOVERNOR_ADDRESS]" "[0]" "[0x00]" "Test Proposal" && \
# Advance a block so the test proposal is active
cast rpc anvil_mine && \

yarn wait-port http://localhost:8000/ && \
(cd governor-subgraph && yarn run create-local && yarn run deploy-local -l v0.0.1) && \
(cd proxy-subgraph && yarn run create-local && yarn run deploy-local -l v0.0.1) && \
# Reattach to docker compose
docker-compose up
