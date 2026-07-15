

/**
 * Sends OTP using MSG91 Widget Send API
 * @param {string} identifier - Mobile number (with country code) or Email
 * @returns {Promise<{success: boolean, reqId?: string, message: string}>}
 */
export const sendOtpViaWidget = async (identifier) => {
  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
  const MSG91_WIDGET_ID = process.env.MSG91_WIDGET_ID;

  try {
    if (!MSG91_AUTH_KEY || !MSG91_WIDGET_ID) {
      console.warn('MSG91 credentials not fully configured. Falling back to local/mock behavior.');
      return { success: false, message: 'MSG91 not configured' };
    }

    let formattedIdentifier = identifier;
    // Auto-prepend country code '91' if the identifier is a 10-digit phone number
    if (/^\d{10}$/.test(identifier)) {
      formattedIdentifier = '91' + identifier;
    }

    const response = await fetch('https://api.msg91.com/api/v5/widget/sendOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_AUTH_KEY,
        identifier: formattedIdentifier,
      }),
    });

    const data = await response.json();

    if (response.ok && data.type === 'success') {
      return {
        success: true,
        reqId: data.message, // The request ID is returned in the message field
        message: 'OTP sent successfully',
      };
    }

    return {
      success: false,
      message: data.message || 'Failed to send OTP via MSG91',
    };
  } catch (error) {
    console.error('Error in sendOtpViaWidget:', error);
    return {
      success: false,
      message: error.message || 'Error occurred while calling MSG91',
    };
  }
};

/**
 * Verifies OTP using MSG91 Widget Verify API
 * @param {string} reqId - The request ID returned from sending OTP
 * @param {string} otp - The OTP entered by the user
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyOtpViaWidget = async (reqId, otp) => {
  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
  const MSG91_WIDGET_ID = process.env.MSG91_WIDGET_ID;

  try {
    if (!MSG91_AUTH_KEY || !MSG91_WIDGET_ID) {
      return { success: false, message: 'MSG91 not configured' };
    }

    const response = await fetch('https://api.msg91.com/api/v5/widget/verifyOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_AUTH_KEY,
        reqId: reqId,
        otp: String(otp),
      }),
    });

    const data = await response.json();

    if (response.ok && data.type === 'success') {
      return {
        success: true,
        message: data.message || 'Verified successfully',
      };
    }

    return {
      success: false,
      message: data.message || 'Invalid OTP',
    };
  } catch (error) {
    console.error('Error in verifyOtpViaWidget:', error);
    return {
      success: false,
      message: error.message || 'Error occurred while calling MSG91 verification',
    };
  }
};
