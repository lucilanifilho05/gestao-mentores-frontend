import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/layouts/AppShell";
import { LoginPage } from "@/pages/auth/LoginPage";
import { AccessDeniedPage } from "@/pages/errors/AccessDeniedPage";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { HomePage } from "@/pages/home/HomePage";
import { UsersPage } from "@/pages/users/UsersPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { CoursesPage } from "@/pages/courses/CoursesPage";

import { CourseMentorsPage } from "@/pages/courses/CourseMentorsPage";
import { ClassesPage } from "@/pages/classes/ClassesPage";
import { TasksPage } from "@/pages/tasks/TasksPage";
import { ActivityTypesPage } from "@/pages/activity-types/ActivityTypesPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,

    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },

  {
    element: <ProtectedRoute />,

    children: [
      {
        element: <AppShell />,

        children: [
          {
            index: true,
            element: <HomePage />,
          },

          {
            path: "usuarios",

            element: (
              <RoleRoute allowed={["COORDENADORA"]}>
                <UsersPage />
              </RoleRoute>
            ),
          },

          {
            path: "cursos",
            element: <CoursesPage />,
          },

          {
            path: "turmas",
            element: <ClassesPage />,
          },

          {
            path: "projetos",
            element: <ProjectsPage />,
          },

          {
            path: "tarefas",
            element: <TasksPage />,
          },

          {
            path: "tipos-atividade",
            element: (
              <RoleRoute allowed={["COORDENADORA"]}>
                <ActivityTypesPage />
              </RoleRoute>
            ),
          },

          {
            path: "cursos/:cursoId/mentores",

            element: (
              <RoleRoute allowed={["COORDENADORA"]}>
                <CourseMentorsPage />
              </RoleRoute>
            ),
          },

          {
            path: "acesso-negado",
            element: <AccessDeniedPage />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
