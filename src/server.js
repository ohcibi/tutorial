import { belongsTo, createServer, hasMany, Model } from "miragejs";

export default function (environment = "development") {
  return createServer({
    environment,

    models: {
      list: Model.extend({
        // this doesn't work as expected
        reminders: hasMany(),
        // but this does
        // reminders: hasMany("reminder", { inverse: "list"}),
      }),

      reminder: Model.extend({
        list: belongsTo("list", { inverse: "reminders" }),
        otherFk: belongsTo("list", { inverse: null }),
      }),
    },

    seeds(server) {
      const homeList = server.create("list", { name: "Home" });
      const workList = server.create("list", { name: "Work" });

      server.create("reminder", {
        list: homeList,
        otherFk: workList,
        text: "Walk the dog",
      });

      server.create("reminder", {
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
