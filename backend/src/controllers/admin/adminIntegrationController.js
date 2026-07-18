import { asyncHandler } from '../../middleware/errorHandler.js';
import { 
  getIntegrationsMetrics, 
  updateIntegrationConfig, 
  testIntegration 
} from '../../services/integrationService.js';

// GET /api/admin/integrations
export const getIntegrations = asyncHandler(async (req, res) => {
  const integrations = await getIntegrationsMetrics();
  res.json({
    success: true,
    data: integrations
  });
});

// PUT /api/admin/integrations/:key
export const updateIntegration = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const configPayload = req.body; // key-value pairs of config values
  
  if (!configPayload || Object.keys(configPayload).length === 0) {
    return res.status(400).json({ success: false, message: 'Configuration payload is required' });
  }

  // Save changes
  const updatedValues = await updateIntegrationConfig(key, configPayload);

  res.json({
    success: true,
    message: 'Integration configuration updated successfully',
    data: updatedValues
  });
});

// POST /api/admin/integrations/:key/test
export const testIntegrationConnection = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const result = await testIntegration(key);

  if (result.success) {
    res.json({
      success: true,
      message: 'Connection successful',
      latency: `${result.latency}ms`
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Connection failed',
      error: result.error
    });
  }
});
