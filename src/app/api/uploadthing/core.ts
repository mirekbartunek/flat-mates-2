import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerAuthSession } from "@/server/auth";
import { db, files } from "@/server/db";
const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const user = await getServerAuthSession();

      // If you throw, the user will not be able to upload
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after uploa
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
