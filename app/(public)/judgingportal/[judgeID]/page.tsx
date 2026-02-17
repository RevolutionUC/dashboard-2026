import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { assignments, judges, projects } from "@/lib/db/schema";

interface ProjectWithLocation {
  id: string;
  name: string;
  location: string;
  location2: string;
}

export default async function JudgingPortalPage({
  params,
}: {
  params: Promise<{ judgeID: string }>;
}) {
  const { judgeID } = await params;

  const judge = await db
    .select({
      id: judges.id,
      name: judges.name,
      judgeGroupId: judges.judgeGroupId,
    })
    .from(judges)
    .where(eq(judges.id, judgeID))
    .limit(1);

  if (judge.length === 0) {
    notFound();
  }

  const judgeInfo = judge[0];

  let assignedProjects: ProjectWithLocation[] = [];

  if (judgeInfo.judgeGroupId !== null) {
    const projectRows = await db
      .select({
        id: projects.id,
        name: projects.name,
        location: projects.location,
        location2: projects.location2,
      })
      .from(assignments)
      .innerJoin(projects, eq(assignments.projectId, projects.id))
      .where(eq(assignments.judgeGroupId, judgeInfo.judgeGroupId))
      .orderBy(projects.name);

    assignedProjects = projectRows;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Judging Portal</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome, {judgeInfo.name}
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">
            You have{" "}
            <span className="font-semibold text-slate-900">
              {assignedProjects.length}
            </span>{" "}
            projects to evaluate
          </p>
        </div>

        {assignedProjects.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-slate-600">
              No projects assigned to your judging group yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {assignedProjects.map((project, index) => (
              <li key={project.id}>
                <div className="block rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {project.name}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>
                          {project.location}
                          {project.location2 ? ` - ${project.location2}` : ""}
                        </span>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
