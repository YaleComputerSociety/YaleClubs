import connectToDatabase from "@/lib/mongodb";
import Event, { IEvent } from "@/lib/models/Event";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  await connectToDatabase();
  const event: IEvent | null = await Event.findById(id);
  if (!event) {
    return {
      title: "Event not found",
    };
  }

  const title = `${event.name} | YaleClubs`;
  const description = `${new Date(event.start).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })} • ${event.location}${event.clubs?.length ? ` • ${event.clubs.join(" x ")}` : ""}`.slice(0, 200);

  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/Events/${id}`;
  const ogImage = `${url}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  } as any;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  await connectToDatabase();
  const event: IEvent | null = await Event.findById(id);
  if (!event) return notFound();

  return (
    <>
      <Link
        href="/"
        className="fixed top-4 right-4 z-50 text-violet-600 hover:text-violet-700 font-semibold bg-white/80 backdrop-blur px-3 py-2 rounded-lg shadow"
      >
        Back to YaleClubs
      </Link>
      <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative w-full aspect-[2/1] bg-gray-100">
            <Image
              src={event.flyer && event.flyer.trim() !== "" ? event.flyer : "/assets/default-background.png"}
              alt="Event Flyer"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
            <div className="text-gray-700 mb-3">
              <div>{new Date(event.start).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
              <div>{event.location}</div>
              <div className="font-medium">{event.clubs?.length ? event.clubs.join(" x ") : "No clubs listed"}</div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>
      </main>
    </>
  );
}
