import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MotionProvider } from "~/components/motion/motion-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return (
    <QueryClientProvider client={client}>
      <MotionProvider>{children}</MotionProvider>
    </QueryClientProvider>
  );
}
