import { revalidatePath } from "next/cache";
import { assertAuthorization } from "@/lib/auth";

type BaseResult = { success: boolean; error?: string };

export function withAuth<
  TArgs extends unknown[],
  TExtra extends Record<string, unknown>,
>(
  fn: (...args: TArgs) => Promise<TExtra>,
  errorPrefix: string,
  revalidate?: string,
) {
  return async (...args: TArgs): Promise<BaseResult & TExtra> => {
    try {
      await assertAuthorization();
      const result = await fn(...args);
      if (revalidate) {
        revalidatePath(revalidate);
      }
      return { success: true, ...result } as BaseResult & TExtra;
    } catch (error) {
      console.error(`${errorPrefix}:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : `Failed to ${errorPrefix}`,
      } as BaseResult & TExtra;
    }
  };
}
