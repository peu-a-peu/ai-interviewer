"use client";

import { useEffect } from "react";
import Home from "./module/Home";
import * as ChannelService from '@channel.io/channel-web-sdk-loader';
import { env } from "@/env";
import { getLocale } from "next-intl/server";
import { useLocale } from "next-intl";

export default function Page() {
  const locale = useLocale()
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ChannelService.loadScript()
      ChannelService.boot({
        "pluginKey": env.NEXT_PUBLIC_CHANNEL_IO_PLUGIN_KEY,
        language: locale
      });
    }
  }, [])
  return <Home />;
}
