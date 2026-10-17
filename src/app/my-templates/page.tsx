import type { Metadata } from "next";

import { MyTemplatesView } from "@/components/dashboard/my-templates-view/my-templates-view";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("My Templates");

const MyTemplatesPage = () => <MyTemplatesView withShell />;

export default MyTemplatesPage;
