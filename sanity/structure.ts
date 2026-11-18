import { createElement } from "react";
import type { StructureResolver } from "sanity/structure";

/** Points editors to the admin area, where filmmakers' stories are reviewed. Nothing is copied into the Studio. */
function ReviewLink() {
  return createElement(
    "div",
    { style: { padding: "2rem", maxWidth: "36rem", lineHeight: 1.6 } },
    createElement("h2", { style: { margin: "0 0 0.75rem", fontSize: "1.25rem" } }, "Filmmaker stories"),
    createElement(
      "p",
      { style: { margin: "0 0 1.25rem", opacity: 0.8 } },
      "Stories sent by filmmakers are reviewed in the admin area. Approving one there publishes it on the Journal.",
    ),
    createElement("a", { href: "/admin/journal", style: { fontWeight: 600 } }, "Open filmmaker stories →"),
  );
}

/** The order of the Studio sidebar: the home page first, then the Journal and About. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Filmmaker stories")
        .child(S.component(ReviewLink).title("Filmmaker stories")),
      S.documentTypeListItem("homePage").title("Home page"),
      S.documentTypeListItem("collection").title("Journal collection"),
      S.documentTypeListItem("journalStory").title("Journal story"),
      S.documentTypeListItem("aboutPage").title("About page"),
    ]);
