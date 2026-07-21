import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;

/**
 * Generate Agora RTC Token for video call sessions / verification interviews
 * @param {string} channelName 
 * @param {string|number} uid 
 * @param {number} expireTimeInSeconds 
 * @returns {string} token
 */
export const generateRtcToken = (channelName, uid = 0, expireTimeInSeconds = 86400) => {
  const appId = process.env.AGORA_APP_ID || '';
  const appCertificate = process.env.AGORA_APP_CERTIFICATE || '';

  if (!appId || !appCertificate) {
    console.warn('[Agora] AGORA_APP_ID or AGORA_APP_CERTIFICATE missing in env. Returning fallback channel token.');
    return `dummy_agora_token_${channelName}_${uid}`;
  }

  const role = RtcRole?.PUBLISHER || 1;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;

  try {
    const numericUid = typeof uid === 'number' ? uid : 0;
    return RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );
  } catch (err) {
    console.error('[Agora] Token generation error:', err.message);
    return `fallback_agora_token_${channelName}`;
  }
};
