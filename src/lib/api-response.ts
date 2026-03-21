import { NextResponse } from 'next/server';

type ErrorResponseExtra = Record<string, unknown>;

export function apiErrorResponse(
  error: string,
  status = 500,
  extra: ErrorResponseExtra = {}
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...extra,
    },
    { status }
  );
}
