"use client";

import { useEffect } from "react";
import Home from "./module/Home";
import * as ChannelService from '@channel.io/channel-web-sdk-loader';
import { env } from "@/env";

export default function Page() {

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ChannelService.loadScript()
      ChannelService.boot({
        "pluginKey": env.NEXT_PUBLIC_CHANNEL_IO_PLUGIN_KEY,
      });
    }
  }, [])
  return <Home />;
}
