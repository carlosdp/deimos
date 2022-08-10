#!/bin/bash

PRIV_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

export GOVERNOR_START_BLOCK=0
export GOVERNOR_PROXY_START_BLOCK=0

# docker-compose up --force-recreate -d && \
(cd contracts && forge script script/DeployLocalEnvironment.s.sol --broadcast --rpc-url=http://localhost:8545 --private-key=$PRIV_KEY -vvv ) # && \
# # setup governor and refund proxy
# wait-port http://localhost:8000/ && \
# (cd governor-subgraph && yarn run create-local && yarn run deploy-local -l v0.0.1) && \
# (cd proxy-subgraph && yarn run create-local && yarn run deploy-local -l v.0.0.1) && \
# # Reattach to docker compose
# docker-compose up
