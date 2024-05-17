// #region IMPORTS
import type { IKChain } from '../IKChain';
import type Pose        from '../../armature/Pose';
import type Bone        from '../../armature/Bone';
import type IKTarget    from '../IKTarget';

import Vec3             from '../../maths/Vec3';
import Quat             from '../../maths/Quat';
// #endregion

function lawcos_sss( aLen, bLen, cLen ){
    // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
    // The Angle between A and B with C being the opposite length of the angle.
    const v = ( aLen**2 + bLen**2 - cLen**2 ) / ( 2 * aLen * bLen );    
    return Math.acos( Math.min( 1, Math.max( -1, v ) ) );  // Clamp to prevent NaN Errors
}

export default function twoBoneSolver( tar: IKTarget, chain: IKChain, pose: Pose ): void{
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // NOTE: Target already constaint the distance between the target and root bone.
    // This value can be used as the 3rd side of the triangle with the two bone lengths
    // being used as the 1st & 2nd side of the triangle for computing all the angles

    // NOTE: Also, lookSolver should be run before this solver. That means the pose bone for 
    // the root should have already been modified to point the bone at the target. We can save
    // one "getWorldRotation" call by taking the target's pworld.rot with root.local.rot
    
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const lnk0      = chain.links[ 0 ];
    const lnk1      = chain.links[ 1 ];
    const root      = pose.getBone( lnk0.index ) as Bone;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // FIRST BONE
    const rot       = new Quat().fromMul( tar.pworld.rot, root.local.rot ); // lookSolved WS Rotation of Bone 1
    const bendAxis  = Vec3.fromQuat( rot, lnk0.axes.ortho );
    let rad         = lawcos_sss( lnk0.len, tar.dist, lnk1.len );

    rot .pmulAxisAngle( bendAxis, -rad )    // Apply Bending Rotation
        .pmulInvert( tar.pworld.rot );      // To Localspace

    pose.setLocalRot( lnk0.index, rot );    // Save to pose

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SECOND BONE
    // Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
    // the other direction. Ex. L->R 70 degrees == R->L 110 degrees

    const pRot  = pose.getWorldRotation( lnk1.pindex );                 // Need parent ws rotation
    rad	        = Math.PI - lawcos_sss( lnk0.len, lnk1.len, tar.dist ); // Bone's Angle
    
    rot
        .fromMul( pRot, lnk1.bind.rot )   // Create unmodified ws rotation for bone 2
        .pmulAxisAngle( bendAxis, rad )   // Apply Bending Rotation
        .pmulInvert( pRot );              // To Localspace

    pose.setLocalRot( lnk1.index, rot );  // Save to pose
}
