-- CreateEnum
CREATE TYPE "TicketStatusModel" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'BLOCKED', 'CLOSED');

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatusModel" NOT NULL DEFAULT 'OPEN',
    "projectId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_history" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "previousData" JSONB NOT NULL,
    "newData" JSONB NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tickets_projectId_idx" ON "tickets"("projectId");

-- CreateIndex
CREATE INDEX "tickets_createdBy_idx" ON "tickets"("createdBy");

-- CreateIndex
CREATE INDEX "tickets_assignedTo_idx" ON "tickets"("assignedTo");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "ticket_comments_ticketId_idx" ON "ticket_comments"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_history_ticketId_idx" ON "ticket_history"("ticketId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
