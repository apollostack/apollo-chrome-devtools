import type { ReactNode } from "react";
import { clsx } from "clsx";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { Content } from "./Content";
import { Header } from "./Header";
import { QueryString } from "./QueryString";
import { Tabs } from "./Tabs";
import { TabContent } from "./TabContent";
import { Title } from "./Title";

interface QueryLayoutProps {
  children: ReactNode;
}

export function QueryLayout({ children }: QueryLayoutProps) {
  return (
    <SidebarLayout.Main
      className={clsx(
        "grid gap-x-6 gap-y-2 !overflow-y-auto !overflow-x-hidden [grid-template-areas:'header'_'content'_'tabs'] [grid-template-columns:minmax(0,1fr)] [grid-template-rows:auto_auto_minmax(0,1fr)]",
        "xl:[grid-template-areas:'header_tabs'_'content_tabs'] xl:[grid-template-columns:minmax(0,1fr)_475px] xl:[grid-template-rows:auto_minmax(0,1fr)]"
      )}
    >
      {children}
    </SidebarLayout.Main>
  );
}

QueryLayout.Content = Content;
QueryLayout.Header = Header;
QueryLayout.QueryString = QueryString;
QueryLayout.Tabs = Tabs;
QueryLayout.TabContent = TabContent;
QueryLayout.Title = Title;
