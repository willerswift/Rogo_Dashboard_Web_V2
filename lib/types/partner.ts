export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type ApiErrorShape = {
  message?: string | string[]
  error?: string
  statusCode?: number
}

export type TokenBundle = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  id_token?: string
}

export type JwtPayload = {
  uid?: string
  user_id?: string
  email?: string
  exp?: number
  [key: string]: JsonValue | undefined
}

export type AbacV2Entry = {
  resources: string[]
  actions: string[]
}

export type UserResourcesResponse = {
  userId: string
  email: string
  partnerResources: string[]
  projectResources: AbacV2Entry[]
}

export type PartnerSession = {
  userId: string
  email: string
  partnerIds: string[]
  activePartnerId: string | null
  partnerResources: string[]
  projectResources: AbacV2Entry[]
  accessTokenExpiresAt?: number
}

export type OrganizationBranding = {
  logo?: string
  displayName?: string
}

export type Organization = {
  uuid: string
  orgId: string
  partnerId: string
  name: string
  description?: string
  status: "ACTIVE" | "DISABLED" | string
  ownerId: string
  createdBy: string
  createdDate?: string
  branding?: OrganizationBranding
}

export type OrgWithOwner = Organization & {
  owner?: {
    email?: string
    name?: string
    [key: string]: JsonValue | undefined
  } | null
}

export type OrganizationMember = {
  uuid: string
  userId: string
  orgId: string
  partnerId: string
  joinedAt: string
  isOwner: boolean
  user?: UserPartner | null
}

export type Project = {
  uuid: string
  name: string
  ownerId: string
  partnerId: string
  orgId?: string | null
  appsdkLimit: number
  needVerifyEmail: boolean
  authorizedServices: Array<Record<string, JsonValue>>
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  }

export type ProjectKeyInfo = {
  pub?: string
  name?: string
}

export type ProjectDetailResponse = {
  numOfIps: number
  project: Project
  keyInfos?: ProjectKeyInfo | null
}

export type GeneratedProjectKey = {
  type?: string
  project_id?: string
  private_key_id?: string
  private_key?: string
  client_email?: string
  client_id?: string
  [key: string]: JsonValue | undefined
}

export type Model = {
  uuid: string
  modelId: string
  name: string
  baseInfo: number[]
  categoryInfo: number[]
  partnerId: string
  extraInfo?: Record<string, JsonValue>
  description?: string
  image?: string
  isPublic: boolean
  sharePartners?: Array<Record<string, JsonValue>>
  isReadyOEM: boolean
  developmentInfo?: Record<string, JsonValue>
  brand?: string
  ownership?: string
  wrapFeatures?: number[]
  releaseStatus?: string
  addressType?: number
  typeIdentify?: number
  msgDecoder?: string
  msgEncoder?: string
  urlImg?: string
  urlIcon?: string
  urlIconDark?: string
  metaData?: Record<string, JsonValue>
}

export type ProductListResponse = {
  data: Model[]
  totalPage: number
  pageSize?: number
  page?: number
}

export type DeviceListResponse = {
  data: Array<Record<string, JsonValue>>
  totalPage: number
  pageSize?: number
  page?: number
}

export type UserPartner = {
  uuid: string
  ownerId: string
  partnerId: string
  email: string
  name: string
  status: number
}

export type UserWithNumProject = {
  user: UserPartner
  numOfProject: number
}

export type UserAbacResponse = {
  userpartner: UserPartner[]
  abac: AbacV2Entry[]
}

export type PermissionRecord = {
  uuid?: string
  ownerId: string
  partnerId: string
  abac: AbacV2Entry[]
  createdDate?: string
  updatedDate?: string
}

export type SuccessResponse = {
  success: boolean
}

export type DeleteModelResponse = {
  modelId: string
  success: boolean
}

export type LoginInput = {
  email: string
  password: string
}

export type CreateOrganizationInput = {
  partnerId: string
  orgId: string
  name: string
  description?: string
  branding?: OrganizationBranding
}

export type UpdateOrganizationInput = Partial<
  Pick<Organization, "name" | "description" | "status" | "branding">
> & {
  partnerId: string
  orgId: string
}

export type TransferOrganizationOwnerInput = {
  partnerId: string
  orgId: string
  newOwnerId: string
}

export type OrganizationUserInput = {
  partnerId: string
  orgId: string
  userId: string
}

export type CreateProjectInput = {
  partnerId: string
  orgId: string
  name: string
  authorizedServices?: Array<Record<string, JsonValue>>
}

export type UpdateProjectInput = {
  name?: string
  needVerifyEmail?: boolean
  authorizedServices?: Array<Record<string, JsonValue>>
}

export type GenerateProjectKeyInput = {
  name: string
  partnerId: string
  projectId: string
  authorizedServices: Array<Record<string, JsonValue>>
}

export type CreateModelInput = {
  modelId: string
  name: string
  baseInfo: number[]
  categoryInfo: number[]
  extraInfo: Record<string, JsonValue>
  partnerId: string
  image: string
  isPublic: boolean
  sharePartners?: Array<Record<string, JsonValue>>
  description?: string
  brand?: string
  ownership?: string
  developmentInfo?: Record<string, JsonValue>
  wrapFeatures?: number[]
  addressType?: number
  typeIdentify?: number
  msgDecoder?: string
  msgEncoder?: string
  urlImg?: string
  urlIcon?: string
  urlIconDark?: string
  metaData?: Record<string, JsonValue>
}

export type UpdateModelInput = Partial<
  Omit<CreateModelInput, "partnerId" | "modelId">
> & {
  partnerId: string
  modelId: string
}

export type ReleaseModelInput = {
  modelId: string
  releaseStatus: string
}

export type DeleteModelInput = {
  partnerId: string
  modelId: string
}

export type CreatePartnerUserInput = {
  partnerId: string
  name: string
  email: string
  password: string
  projectId: string
}

export type DeletePartnerUserInput = {
  partnerId: string
  uuid: string
}

export type CheckUserExistInput = {
  email: string
  partnerId: string
  projectId?: string
}

export type GrantPermissionInput = {
  ownerId: string
  partnerId: string
  entries: AbacV2Entry[]
}

export type RevokePermissionInput = {
  ownerId: string
  partnerId: string
  resources: string[]
  actions?: string[]
}
