"use client";

import { Provider as ReduxProvider } from "react-redux";
import { ApolloProvider } from "@apollo/client/react";
import { ToastProvider } from "../../components/Toast";
import { client } from "@/GraphQL/clientConfig";
import { store } from "@/Redux/store/store";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>
        <ToastProvider>{children}</ToastProvider>
      </ApolloProvider>
    </ReduxProvider>
  );
}
