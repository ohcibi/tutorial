import { belongsTo, createServer, hasMany, Model } from "miragejs";

export default function (environment = "development") {
  return createServer({
    environment,

    models: {
      list: Model.extend({
        reminders: hasMany(),
      }),

      reminder: Model.extend({
        list: belongsTo("list", { inverse: "reminders" }),
        otherFk: belongsTo("list", { inverse: null }),
      }),
    },

    seeds(server) {
      const homeList = server.create("list", { name: "Home" });
      const workList = server.create("list", { name: "Work" });

      server.create("reminder", { list: homeList, text: "Walk the dog" });
      server.create("reminder", { list: homeList, text: "Take out the trash" });
      server.create("reminder", { list: homeList, text: "Work out" });

      server.create("reminder", {
        list: workList,
        otherFk: homeList,
        text: "Figure out multiple FKs to the same model"
      });

      server.create("reminder", {
        list: workList,
        otherFk: homeList,
        text: "Review design doc"
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

        // list.reminders contains reminders for both lists, where either listId or otherFkId match the list's id.
        return list.reminders;

        // this works as expected though
        // return schema.reminders.where({ listId });
      })
    },
  })
}
