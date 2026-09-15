-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

-- CreateIndex
CREATE INDEX "projects_createdBy_idx" ON "projects"("createdBy");
