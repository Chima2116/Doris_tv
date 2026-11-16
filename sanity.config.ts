import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { structure } from "./sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { dataset, projectId } from "./sanity/env";

export default defineConfig({
  name: "doris-tv",
  title: "DORIS TV",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
