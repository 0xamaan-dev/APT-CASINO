import React from 'react';
import { Box, Tooltip, IconButton, Chip } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { getInitiaExplorerUrl, getPythEntropyTxExplorerUrl } from '@/utils/networkUtils';

/**
 * Transaction Links Component
 * 
 * Compact display of transaction links for both networks.
 * Used in tables and compact displays.
 * 
 * Validates: Requirements 4.7, 4.8, 5.6, 8.6, 8.10
 */
const TransactionLinks = ({ 
  initiaTxHash, 
  arbitrumSepoliaTxHash,
  showLabels = true,
  size = 'small'
}) => {
  if (!initiaTxHash && !arbitrumSepoliaTxHash) {
    return <span>-</span>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {initiaTxHash && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showLabels && (
            <Chip
              label="INIT"
              size="small"
              color="success"
              sx={{ 
                height: 18, 
                fontSize: '0.65rem',
                '& .MuiChip-label': { px: 0.5 }
              }}
            />
          )}
          <Tooltip title={`View on Initia Explorer: ${initiaTxHash}`} arrow>
            <IconButton
              size={size}
              href={getInitiaExplorerUrl(initiaTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'success.main',
                p: 0.25
              }}
            >
              <OpenInNew sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.75rem',
            color: '#666'
          }}>
            {initiaTxHash.slice(0, 6)}...{initiaTxHash.slice(-4)}
          </span>
        </Box>
      )}

      {arbitrumSepoliaTxHash && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {showLabels && (
            <Chip
              label="ARB"
              size="small"
              color="info"
              sx={{ 
                height: 18, 
                fontSize: '0.65rem',
                '& .MuiChip-label': { px: 0.5 }
              }}
            />
          )}
          <Tooltip title={`View on Arbitrum Sepolia Explorer: ${arbitrumSepoliaTxHash}`} arrow>
            <IconButton
              size={size}
              href={getPythEntropyTxExplorerUrl(arbitrumSepoliaTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'info.main',
                p: 0.25
              }}
            >
              <OpenInNew sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.75rem',
            color: '#666'
          }}>
            {arbitrumSepoliaTxHash.slice(0, 6)}...{arbitrumSepoliaTxHash.slice(-4)}
          </span>
        </Box>
      )}
    </Box>
  );
};

export default TransactionLinks;
