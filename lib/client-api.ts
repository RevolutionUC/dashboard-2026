async function parseErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.error === "string") {
      return data.error;
    }
  } catch {
    // Ignore JSON parse errors and use fallback.
  }
  return fallbackMessage;
}

export async function postJson<TPayload, TResponse>(
  url: string,
  payload: TPayload,
  fallbackErrorMessage: string,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, fallbackErrorMessage));
  }

  return response.json() as Promise<TResponse>;
}

export async function patchJson<TPayload, TResponse>(
  url: string,
  payload: TPayload,
  fallbackErrorMessage: string,
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, fallbackErrorMessage));
  }

  return response.json() as Promise<TResponse>;
}

export async function deleteById(url: string): Promise<boolean> {
  const response = await fetch(url, {
    method: "DELETE",
  });
  return response.ok;
}
