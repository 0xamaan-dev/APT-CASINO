import React from 'react';
import { Box, Typography, Paper, Chip, Link } from '@mui/material';
import { OpenInNew, Verified } from '@mui/icons-material';
import { getInitiaExplorerUrl, getPythEntropyTxExplorerUrl } from '@/utils/networkUtils';

/**
 * Dual Network Transaction Display Component
 * 
 * Displays transaction hashes from both networks in the cross-chain architecture:
 * - Initia EVM Testnet: Game result logging
 * - Arbitrum Sepolia: Pyth Entropy randomness generation
 * 
 * Validates: Requirements 4.7, 4.8, 5.6, 8.6, 8.10
 */
const DualNetworkTransactionDisplay = ({ 
  initiaTxHash, 
  arbitrumSepoliaTxHash,
  initiaBlockNumber,
  arbitrumSepoliaBlockNumber,
  entropyRequestId,
  vrfValue,
  compact = false 
}) => {
  if (!initiaTxHash && !arbitrumSepoliaTxHash) {
    return null;
  }

  const TransactionLink = ({ txHash, explorerUrl, label, color = 'primary' }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Link
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: `${color}.main`,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {txHash.slice(0, 10)}...{txHash.slice(-8)}
        </Typography>
        <OpenInNew sx={{ fontSize: 14 }} />
      </Link>
    </Box>
  );

  if (compact) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {initiaTxHash && (
          <TransactionLink
            txHash={initiaTxHash}
            explorerUrl={getInitiaExplorerUrl(initiaTxHash)}
            label="Initia TX"
            color="success"
          />
        )}
        {arbitrumSepoliaTxHash && (
          <TransactionLink
            txHash={arbitrumSepoliaTxHash}
            explorerUrl={getPythEntropyTxExplorerUrl(arbitrumSepoliaTxHash)}
            label="Entropy TX"
            color="info"
          />
        )}
      </Box>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Verified color="success" />
        <Typography variant="h6">
          Cross-Chain Verification
        </Typography>
        <Chip
          label="Dual Network"
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* CreditCoin Transaction */}
        {initiaTxHash && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'success.50',
              borderColor: 'success.main',
              borderWidth: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label="INITIA TESTNET"
                size="small"
                color="success"
                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                Game Log
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TransactionLink
                txHash={initiaTxHash}
                explorerUrl={getInitiaExplorerUrl(initiaTxHash)}
                label="Transaction Hash"
                color="success"
              />
              
              {initiaBlockNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Block Number:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    #{initiaBlockNumber}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

        {/* Arbitrum Sepolia Transaction */}
        {arbitrumSepoliaTxHash && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'info.50',
              borderColor: 'info.main',
              borderWidth: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label="PYTH ENTROPY"
                size="small"
                color="info"
                sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
              />
              <Typography variant="caption" color="text.secondary">
                Entropy Generation
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TransactionLink
                txHash={arbitrumSepoliaTxHash}
                explorerUrl={getPythEntropyTxExplorerUrl(arbitrumSepoliaTxHash)}
                label="Transaction Hash"
                color="info"
              />
              
              {arbitrumSepoliaBlockNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Block Number:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    #{arbitrumSepoliaBlockNumber}
                  </Typography>
                </Box>
              )}

              {entropyRequestId && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Request ID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {entropyRequestId.slice(0, 10)}...{entropyRequestId.slice(-8)}
                  </Typography>
                </Box>
              )}

              {vrfValue && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    VRF Value:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {vrfValue.slice(0, 12)}...
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          backgroundColor: 'primary.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'primary.200'
        }}
      >
        <Typography variant="caption" color="text.secondary">
          🔒 <strong>Dual Network Verification:</strong> Randomness generated on Arbitrum Sepolia using Pyth Entropy, 
          game result logged on Initia EVM Testnet. Both transactions are permanently recorded on their respective 
          blockchains for independent verification.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DualNetworkTransactionDisplay;
