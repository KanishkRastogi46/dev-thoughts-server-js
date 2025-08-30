import { Reflector } from "@nestjs/core"
import { RoleNames } from "../enum/role.enum"

export const RolesDecorator = Reflector.createDecorator<RoleNames[]>(
    { 
        key: 'roles', 
        transform: (roles: RoleNames[]) => roles 
    }
)