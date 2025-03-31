import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "@/server/auth";
import { db, files } from "@/server/db";
const f = createUploadthing();
const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ files }) => {
      const fileTypes = files.map((file) => file.type);
      if (!fileTypes.some((type) => ALLOWED_FORMATS.includes(type))) {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: `Only ${ALLOWED_FORMATS.toString()} image formats are allowed`,
        });
      }
      const user = await getServerAuthSession();

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(file.type);
      console.log("Upload complete for userId:", metadata.userId);
      const res = await db
        .insert(files)
        .values({
          uploadedBy: metadata.userId,
          name: file.name,
          url: file.url,
          key: file.key,
        })
        .returning({ id: files.id });
      console.log(res);
      console.log("file url", file.url);
      const ids = res.map((file) => file.id);

      return { uploadedBy: metadata.userId, ids };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
