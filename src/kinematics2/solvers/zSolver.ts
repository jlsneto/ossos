// #region IMPORTS
import type { IKChain } from '../IKChain';
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';

import Vec3             from '../../maths/Vec3';
import Quat             from '../../maths/Quat';
import Transform        from '../../maths/Transform';
// #endregion

function lawcos_sss( aLen: number, bLen: number, cLen: number ): number{
    // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
    // The Angle between A and B with C being the opposite length of the angle.
    const v = ( aLen**2 + bLen**2 - cLen**2 ) / ( 2 * aLen * bLen );
    return Math.acos( Math.min( 1, Math.max( -1, v ) ) );  // Clamp to prevent NaN Errors
}

// REQUIRED - THIS SOLVER REQUIRED LOOKSOLVER TO BE EXECUTED FIRST
// LookSolver will align the chain toward the IK target, then this solver
// will that blend the bones into a Z Shape

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ZSolver( tar: IKTarget, chain: IKChain, pose: Pose, debug: any ): void{
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Prepare
    const l0    = chain.links[ 0 ];
    const l1    = chain.links[ 1 ];
    const l2    = chain.links[ 2 ];

    const aLen  = l0.len;       // Length of the First three bones
    const bLen  = l1.len;
    const cLen  = l2.len;
    const bhLen = bLen * 0.5;   // Half the Length of the middle bone

    // Subdivide target length between two triangles
    // Use ratio of how much of the target length to use for the first triangle
    const ratio = ( aLen + bhLen ) / ( aLen + bLen + cLen ); // How much len does the first tri use of total chain
    const taLen = tar.dist * ratio; // Long Side for 1st Triangle
    const tbLen = tar.dist - taLen; // Long side for 2nd Triangle ( Use rest of target distance )

    // TODO - Dont really need transforms, can just use quats. EZer to debug usig Pos data
    const ptran = new Transform(); // Parent Bone WS Transform
    const ctran = new Transform(); // Current Bone WS Transform

    // Axis of rotation after LookSolver aligns chain to target
    const axis  = new Vec3().fromCross( tar.twist, tar.swing );
    const rot   = new Quat();
    let rad: number;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 1ST BONE : aLen, taLen, bhLen

    // Dont need ?? as bone should always exist but to satisify TypeScript &
    // Nullable returns I wrote it to use the bind by some crazy chance it fails
    const root = pose.getBone( l0.index )?.local ?? l0.bind;

    pose.getWorldTransform( l0.pindex, ptran );
    ctran.fromMul( ptran, root );               // lookSolver WS Rotation of Bone 0

    rad	= lawcos_sss( aLen, taLen, bhLen );	    // Get the Angle between First Bone and Target.
    rot
        .copy( ctran.rot )
        .pmulAxisAngle( axis, -rad )            // Use the Axis X to rotate by Radian Angle
        .pmulInvert( ptran.rot );               // To Local

    pose.setLocalRot( l0.index, rot );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 2ND BONE : aLen, bhLen, taLen
    pose.getWorldTransform( l1.pindex, ptran );
    ctran.fromMul( ptran, l1.bind );

    rad	= Math.PI - lawcos_sss( aLen, bhLen, taLen );   // Get the Angle between First Bone and Target.
    rot
        .copy( ctran.rot )
        .pmulAxisAngle( axis, rad )         // Use the Axis X to rotate by Radian Angle
        .pmulInvert( ptran.rot );           // To Local

    pose.setLocalRot( l1.index, rot );

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 3RD BONE : cLen, bhLen, tbLen
    pose.getWorldTransform( l2.pindex, ptran );
    ctran.fromMul( ptran, l2.bind );

    rad	= Math.PI - lawcos_sss( cLen, bhLen, tbLen );	// Get the Angle between First Bone and Target.
    rot
        .copy( ctran.rot )
        .pmulAxisAngle( axis, -rad )         // Use the Axis X to rotate by Radian Angle
        .pmulInvert( ptran.rot );           // To Local

    pose.setLocalRot( l2.index, rot );
}