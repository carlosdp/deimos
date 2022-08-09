#!/bin/bash

PRIV_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

cd contracts && \
forge script script/DeployGovernorGasRefundProxy.s.sol --broadcast --rpc-url=http://localhost:8545 --private-key=$PRIV_KEY
