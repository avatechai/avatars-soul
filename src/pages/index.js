import Chat from './lib/Chat'
import { NextUIProvider } from "@nextui-org/react";

export default function Home() {
  return (
    <NextUIProvider>
      <Chat />
    </NextUIProvider>
  )
}
