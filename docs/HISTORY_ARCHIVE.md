# History archive

The History page now has a curated visual archive below the main chronology. It is deliberately a different mode from the four History chapters: the chronology explains; the archive lets visitors inspect surviving film, photographs and records.

## Content model

`content/archive-media.json` is the source of truth. Each record keeps:

- a stable Watch ID;
- date, place and media type;
- source institution and catalogue identifier;
- a short Watch caption and separate context note;
- rights status and the date those rights were checked;
- delivery mode (`self_host`, `external`, `official_embed`, `permission_pending`);
- optional R2 mirror keys;
- optional links back to History events.

Do not collapse archive descriptions and Watch context into one field. Historical catalogues can contain dated language or institutional framing; provenance should remain visible without silently adopting it.

## Delivery

The page works before R2 exists. Open-license items fall back to their official source media and external-only records stay linked to the institution.

For production mirroring, create a separate public bucket:

```text
westpapua-watch-media
```

and attach a custom domain such as:

```text
media.westpapua.watch
```

Keep `westpapua-watch-archive` private. It already contains engine and geographic material and should not become public just to serve History media.

After the public media bucket is populated, set this Pages build variable and rebuild:

```text
PUBLIC_ARCHIVE_MEDIA_BASE=https://media.westpapua.watch
```

`src/data/archive.ts` will then prefer the R2 mirror paths. Hover previews are R2-only; without that variable the mosaic stays still and playback starts only after a visitor opens the viewer.

## Syncing open media

The archive sync is manual on purpose. Rights need human review.

```bash
npm run archive:validate
npm run archive:sync
```

The sync script only accepts `self_host` records whose rights are one of:

- public domain;
- CC0;
- CC BY;
- CC BY-SA.

It downloads the source, makes web-sized derivatives with ffmpeg, and uploads them to `westpapua-watch-media`. For films it produces a poster, a short silent preview and an H.264/AAC playback file. For images it produces display and poster WebP files.

The GitHub workflow `Archive media` performs the same operation manually through `workflow_dispatch`. Run it only after the bucket exists and the Cloudflare deployment token can write R2 objects.

## Adding a record

1. Verify the exact source object and catalogue identifier.
2. Record the original institution URL.
3. Verify rights on the item itself. Collection-level assumptions are not enough.
4. If rights are unclear, use `external` or `permission_pending`.
5. Keep the copy short. The viewer has only two editorial blocks: the record caption and `Context`.
6. Choose mosaic layout intentionally: `hero`, `wide`, `standard`, or `portrait`.
7. Run `npm run check:content` and `npm run archive:validate`.

## Performance rules

- Mosaic tiles start as still images.
- Hover previews exist only when an R2 preview derivative exists.
- At most one preview video plays at a time.
- Mobile does not autoplay previews.
- Reduced-motion visitors get still images only.
- Full film playback uses `preload="metadata"` and starts inside the viewer.
