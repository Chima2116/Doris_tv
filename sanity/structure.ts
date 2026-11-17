import type { StructureResolver } from "sanity/structure";

/** The order of the Studio sidebar: the home page first, then the Journal, filmmakers and About. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Review queue")
        .child(
          S.documentList()
            .title("Pending review")
            .filter('_type == "journalStory" && status == "pending"')
            .defaultOrdering([{ field: "_createdAt", direction: "asc" }])
        ),
      S.documentTypeListItem("homePage").title("Home page"),
      S.documentTypeListItem("collection").title("Journal collection"),
      S.documentTypeListItem("journalStory").title("Journal story"),
      S.documentTypeListItem("filmmaker").title("Filmmaker"),
      S.documentTypeListItem("aboutPage").title("About page"),
    ]);
