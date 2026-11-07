/**
 * @jest-environment node
 */
import {
  HIDDEN_LOCATION_TEXT,
  htmlToPlainText,
  isHiddenLocation,
  isPublicEvent,
  mapTags,
  mapYaleConnectItem,
  parseYaleConnectRss,
} from "@/lib/yaleconnect";
import { EventLocationType, Tag } from "@/lib/models/Event";

const item = (fields: string) => `<item>
  <eventId>2328015</eventId>
  <groupId>37808</groupId>
  <group>Urban Resources Initiative</group>
  <groupType>Yale School of the Environment</groupType>
  <cohostingGroupIds>74323,32717</cohostingGroupIds>
  <cohostingGroupNames>Office of Educational Opportunity,FGLI Thrive</cohostingGroupNames>
  <locationType>Off-Campus</locationType>
  <foodProvided>1</foodProvided>
  <eventPhotoAltText>volunteers in Kensington Playground</eventPhotoAltText>
  <iCalLink>https://yaleconnect.yale.edu/vcal?source=rss_feed&amp;type=ical&amp;school=yale&amp;uid=abc</iCalLink>
  <title>New Haven Greenspace &amp; Volunteering</title>
  <fullDescription>&lt;p&gt;Weeding &amp;amp; planting.&lt;br&gt;Bring water.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;Hats&lt;/li&gt;&lt;/ul&gt;</fullDescription>
  <eventStartDateTime>2026-08-29T09:00:00.0000000-04:00</eventStartDateTime>
  <eventEndDateTime>2026-08-29T12:00:00.0000000-04:00</eventEndDateTime>
  <eventLocation>Kensington Playground</eventLocation>
  <eventPhotoFullUrl>https://yaleconnect.yale.edu/upload/photo.jpeg</eventPhotoFullUrl>
  <eventFlyerFullUrl></eventFlyerFullUrl>
  <eventLink>https://yaleconnect.yale.edu/URI/rsvp?id=2328015</eventLink>
  <eventExternalRegistrationLink>tinyurl.com/NHVgreenspace</eventExternalRegistrationLink>
  <eventType>Commmunity Service &amp; Volunteer</eventType>
  <eventTopicsSeparated><eventTopic>Community</eventTopic><eventTopic>Free Food </eventTopic><eventTopic></eventTopic></eventTopicsSeparated>
  <privacyLevel>0</privacyLevel>
  <approvalStatus>1</approvalStatus>
  <eventDelete>0</eventDelete>
  ${fields}
</item>`;

const feed = (...items: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>yale Events</title>${items.join(
    "",
  )}</channel></rss>`;

describe("YaleConnect feed", () => {
  it("parses a feed with a single item", async () => {
    const items = await parseYaleConnectRss(feed(item("")));
    expect(items).toHaveLength(1);
    expect(items[0].eventId).toBe("2328015");
  });

  it("returns no items for an empty channel", async () => {
    expect(await parseYaleConnectRss(feed())).toEqual([]);
  });

  it("maps an item onto the Event shape", async () => {
    const [raw] = await parseYaleConnectRss(feed(item("")));
    const mapped = mapYaleConnectItem(raw, new Map([[37808, "URI (YaleClubs name)"]]));

    expect(mapped).toMatchObject({
      externalId: "2328015",
      name: "New Haven Greenspace & Volunteering",
      clubs: ["URI (YaleClubs name)", "Office of Educational Opportunity", "FGLI Thrive"],
      location: "Kensington Playground",
      registrationLink: "https://tinyurl.com/NHVgreenspace",
      externalLink: "https://yaleconnect.yale.edu/URI/rsvp?id=2328015",
      flyer: "https://yaleconnect.yale.edu/upload/photo.jpeg",
      topics: ["Community", "Free Food"],
    });
    expect(mapped?.start.toISOString()).toBe("2026-08-29T13:00:00.000Z");
    expect(mapped?.end?.toISOString()).toBe("2026-08-29T16:00:00.000Z");
    expect(mapped?.description).toBe("Weeding & planting.\nBring water.\n\n• Hats");
    expect(mapped?.tags).toEqual(expect.arrayContaining([Tag.CommunityService, Tag.FreeFood]));
  });

  it("lists host and co-hosts, using our club names where they match", async () => {
    const [raw] = await parseYaleConnectRss(feed(item("")));
    expect(mapYaleConnectItem(raw)?.clubs).toEqual([
      "Urban Resources Initiative",
      "Office of Educational Opportunity",
      "FGLI Thrive",
    ]);
    expect(mapYaleConnectItem(raw, new Map([[32717, "FGLI on YaleClubs"]]))?.clubs).toEqual([
      "Urban Resources Initiative",
      "Office of Educational Opportunity",
      "FGLI on YaleClubs",
    ]);
  });

  it("keeps the extra YaleConnect details", async () => {
    const [raw] = await parseYaleConnectRss(feed(item("")));
    expect(mapYaleConnectItem(raw)).toMatchObject({
      eventType: "Commmunity Service & Volunteer",
      locationType: EventLocationType.OffCampus,
      hostCategory: "Yale School of the Environment",
      foodProvided: true,
      imageAlt: "volunteers in Kensington Playground",
      icalLink: "https://yaleconnect.yale.edu/vcal?source=rss_feed&type=ical&school=yale&uid=abc",
    });
  });

  it("only uses a real sign-up link as the registration link", async () => {
    const [raw] = await parseYaleConnectRss(
      feed(item("")).replace(/<eventExternalRegistrationLink>.*<\/eventExternalRegistrationLink>/, ""),
    );
    const mapped = mapYaleConnectItem(raw);
    expect(mapped?.registrationLink).toBeUndefined();
    expect(mapped?.externalLink).toBe("https://yaleconnect.yale.edu/URI/rsvp?id=2328015");
  });

  it("tags events with food provided as Free Food", () => {
    expect(mapTags("Group Meeting", [], true)).toEqual([Tag.FreeFood]);
  });

  it("keeps real locations visible", async () => {
    const [raw] = await parseYaleConnectRss(feed(item("")));
    expect(mapYaleConnectItem(raw)).toMatchObject({ location: "Kensington Playground", locationHidden: false });
  });

  it("replaces hidden locations with a YaleConnect link placeholder", async () => {
    const xml = feed(item("")).replace(
      "<eventLocation>Kensington Playground</eventLocation>",
      "<eventLocation>Private Location (sign in to display)</eventLocation>",
    );
    const [raw] = await parseYaleConnectRss(xml);
    expect(mapYaleConnectItem(raw)).toMatchObject({
      location: HIDDEN_LOCATION_TEXT,
      locationHidden: true,
      externalLink: "https://yaleconnect.yale.edu/URI/rsvp?id=2328015",
    });
  });

  it("detects YaleConnect's hidden-location placeholders", () => {
    expect(isHiddenLocation("Private Location (sign in to display)")).toBe(true);
    expect(isHiddenLocation("Private Location (register to display)")).toBe(true);
    expect(isHiddenLocation("")).toBe(true);
    expect(isHiddenLocation(undefined)).toBe(true);
    expect(isHiddenLocation("Online Event")).toBe(false);
    expect(isHiddenLocation("Battell Chapel, 400 College Street")).toBe(false);
  });

  it("rejects items without a start time", () => {
    expect(mapYaleConnectItem({ eventId: "1", title: "x" })).toBeNull();
  });

  it("only treats public, approved, non-deleted events as public", () => {
    expect(isPublicEvent({ privacyLevel: "0", approvalStatus: "1", eventDelete: "0" })).toBe(true);
    expect(isPublicEvent({ privacyLevel: "13", approvalStatus: "1", eventDelete: "0" })).toBe(false);
    expect(isPublicEvent({ privacyLevel: "0", approvalStatus: "0", eventDelete: "0" })).toBe(false);
    expect(isPublicEvent({ privacyLevel: "0", approvalStatus: "1", eventDelete: "1" })).toBe(false);
  });

  it("maps event types to tags", () => {
    expect(mapTags("Lecture, Talk, or Panel", [])).toEqual([Tag.Speaker]);
    expect(mapTags("Group Meeting", [])).toEqual([]);
  });

  it("strips HTML and decodes entities", () => {
    expect(htmlToPlainText("<p>Hi&nbsp;there &#8212; <strong>all</strong></p>")).toBe("Hi there — all");
    expect(htmlToPlainText("Use this link: < tinyurl.com/x > to sign up<!-- note -->")).toBe(
      "Use this link: < tinyurl.com/x > to sign up",
    );
  });
});
