import { belongsTo, createServer, hasMany, Model } from "miragejs";

export default function (environment = "development") {
  return createServer({
    environment,

  models: {
    user: Model.extend({
      blogPosts: hasMany(),
    }),

    blogPost: Model.extend({
      author: belongsTo("user", { inverse: "blogPosts" }),
      reviewer: belongsTo("user", { inverse: null }),
    }),
  },

    seeds(server) {
      const homeList = server.create("user", { name: "Home" });
      const workList = server.create("user", { name: "Work" });

      server.create("blog-post", {
        list: homeList,
        otherFk: workList,
        text: "Walk the dog",
      });

      server.create("blog-post", {
        list: workList,
        otherFk: homeList,
        text: "Figure out multiple FKs to the same model",
      });
    },

    routes() {
      this.get("/api/reminders", (schema) => {
        return schema.reminders.all();
      })

      this.post("/api/reminders", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);

        return schema.reminders.create(attrs);
      })

      this.delete("/api/reminders/:id", (schema, request) => {
        const id = request.params.id;

        return schema.reminders.find(id).destroy();
      })

      this.get("/api/lists", (schema, request) => {
        return schema.lists.all();
      })

      this.get("/api/lists/:id/reminders", (schema, request) => {
        const listId = request.params.id;
        const list = schema.lists.find(listId);

        // this surprisingly returns both reminders for both list IDs
        return list.reminders;

        // this returns nothing for list 1 (homeList) and both reminders for list 2 (workList)
        // return schema.reminders.where({ listId });
      })
    },
  })
}
