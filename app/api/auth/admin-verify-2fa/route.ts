import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code, trustDevice } = await request.json();

    // For now, this is a simplified 2FA verification
    // In production, you would:
    // 1. Verify the code against the user's TOTP secret
    // 2. Check if the code is valid and not expired
    // 3. Handle device trust logic

    // Mock 2FA verification - accept any 6-digit code for now
    // TODO: Implement real TOTP verification using a library like 'otplib'
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 });
    }

    // In a real implementation, you would:
    // - Fetch the user's TOTP secret from database
    // - Verify the code using: otplib.authenticator.verify({ token: code, secret: userSecret })
    // - Log the trusted device if trustDevice is true

    return NextResponse.json({
      success: true,
      trustDevice,
    });
  } catch (error) {
    console.error('2FA verification exception:', error);
    return NextResponse.json(
      { error: '2FA verification failed' },
      { status: 500 }
    );
  }
}
