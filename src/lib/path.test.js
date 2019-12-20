import { match, resolve, insertParams } from "./path";

describe("match", () => {
  test("works", () => {
    expect(match("/foo/:bar", "/foo/hello")).toMatchSnapshot();
  });
});

describe("resolve", () => {
  it("works with a / base", () => {
    expect(resolve("contacts/ryan", "/")).toEqual("/contacts/ryan");
  });

  test("a bunch of resolves", () => {
    expect(resolve("/somewhere/else", "/users/123")).toEqual("/somewhere/else");
    expect(resolve("settings", "/users/123")).toEqual("/users/123/settings");
    expect(resolve("../../one/../two/.././three", "/a/b/c/d/e/f/g")).toEqual(
      "/a/b/c/d/e/three"
    );
    expect(resolve("./", "/users/123")).toEqual("/users/123");
    expect(resolve(".", "/users/123")).toEqual("/users/123");
    expect(resolve("../", "/users/123")).toEqual("/users");
    expect(resolve("../..", "/users/123")).toEqual("/");
    expect(resolve("../.././3", "/u/1/g/4")).toEqual("/u/1/3");
    expect(resolve("../.././s?beef=boof", "/u/1/g/4")).toEqual(
      "/u/1/s?beef=boof"
    );
    expect(resolve("../.././3", "/u/1/g/4?beef=boof")).toEqual("/u/1/3");
    expect(resolve("stinky/barf", "/u/1/g/4")).toEqual("/u/1/g/4/stinky/barf");
    expect(resolve("?some=query", "/users/123?some=thing")).toEqual(
      "/users/123?some=query"
    );
    expect(resolve("/groups?some=query", "/users?some=thing")).toEqual(
      "/groups?some=query"
    );
  });
});

describe("insertParams", () => {
  it("works", () => {
    expect(
      insertParams("/users/:userId/groups/:groupId", {
        userId: "2",
        groupId: "4"
      })
    ).toEqual("/users/2/groups/4");
  });
});
