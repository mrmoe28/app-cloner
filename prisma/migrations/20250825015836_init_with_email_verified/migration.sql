-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('UPLOADED', 'ANALYZING', 'ANALYZED', 'GENERATING', 'GENERATED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PlatformType" AS ENUM ('WEB', 'MOBILE', 'DESKTOP', 'TABLET');

-- CreateEnum
CREATE TYPE "public"."FrameworkType" AS ENUM ('REACT', 'REACT_NATIVE', 'FLUTTER', 'VUE', 'ANGULAR', 'SVELTE', 'NATIVE_IOS', 'NATIVE_ANDROID', 'XAMARIN', 'IONIC', 'CORDOVA');

-- CreateEnum
CREATE TYPE "public"."FileType" AS ENUM ('COMPONENT', 'API', 'CONFIG', 'STYLE', 'SCHEMA', 'PAGE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "image" TEXT,
    "email_verified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uploaded_images" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "preview" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analyses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform_detection" TEXT NOT NULL,
    "components" TEXT NOT NULL,
    "layout_structure" TEXT NOT NULL,
    "design_tokens" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "processing_time" INTEGER NOT NULL,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_code" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "platform" "public"."PlatformType" NOT NULL,
    "framework" "public"."FrameworkType" NOT NULL,
    "package_json" TEXT NOT NULL,
    "deployment_config" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_files" (
    "id" TEXT NOT NULL,
    "generated_code_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."FileType" NOT NULL,

    CONSTRAINT "generated_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "public"."sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "public"."verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "public"."verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_images_project_id_key" ON "public"."uploaded_images"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "analyses_project_id_key" ON "public"."analyses"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_code_project_id_key" ON "public"."generated_code"("project_id");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uploaded_images" ADD CONSTRAINT "uploaded_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."analyses" ADD CONSTRAINT "analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_code" ADD CONSTRAINT "generated_code_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_files" ADD CONSTRAINT "generated_files_generated_code_id_fkey" FOREIGN KEY ("generated_code_id") REFERENCES "public"."generated_code"("id") ON DELETE CASCADE ON UPDATE CASCADE;
