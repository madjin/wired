import { fetchProjects } from "@/src/server/helpers/fetchProjects";
import { getServerSession } from "@/src/server/helpers/getServerSession";
import Card from "@/src/ui/Card";
import CardGrid from "@/src/ui/CardGrid";

export default async function Published() {
  const session = await getServerSession();

  if (!session) return null;

  const projects = await fetchProjects();
  const publishedProjects = projects.filter((p) => p.spaceId);

  if (publishedProjects.length === 0) return null;

  return (
    <>
      <div className="pt-4 text-2xl font-bold">🌍 Published</div>

      <CardGrid>
        {publishedProjects.map(({ publicId, title, image }) => (
          <Card key={publicId} href={`/project/${publicId}`} text={title} image={image} />
        ))}
      </CardGrid>
    </>
  );
}
