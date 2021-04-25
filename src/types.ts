import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}

export { MyContext }