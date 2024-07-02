// #region IMPORTS
import type { IKChain, IKLink } from '../IKChain';
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';

import Vec3             from '../../maths/Vec3';
import Quat             from '../../maths/Quat';
import Transform        from '../../maths/Transform';
// #endregion


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function swingTwistChainSolver( tar: IKTarget, chain: IKChain, pose: Pose, Debug ?: any ): void{
    const cMax   = chain.links.length - 1;
    const ptran  = new Transform();         // Parent Bone WS Transform
    const ctran  = new Transform();         // Current Bone WS Transform ( parent.ws + lnk.bind )
    const tDir   = new Vec3();              // Target Direction
    const dir    = new Vec3();              // Current Direction
    const sRot   = new Quat();              // Swing Rotation
    const tRot   = new Quat();              // Twist Rotation

    let   t     : number;
    let   lnk   : IKLink;

    for( let i=0; i <= cMax; i++ ){
        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // PREPARE
        lnk = chain.links[ i ];
        t   = i / cMax;

        // Get the World transform to the root's parent bone of the chain
        // Then add bone's LS bind transform to get its current unmodified world transform
        pose.getWorldTransform( lnk.pindex, ptran );
        ctran.fromMul( ptran, lnk.bind );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SWING - Rotate bone so its swing direction matches the targets
        tDir.fromLerp( tar.swing, tar.altSwing, t ).norm(); // Target Swing Direction
        dir.fromQuat( ctran.rot, lnk.axes.swing );  // Get bone's ws bound swing dir
        sRot
            .fromSwing( dir, tDir )                 // Create rotation from current to target swing direction
            .mul( ctran.rot );                      // Apply swing rotation to bone's initial rotation

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // TWIST
        tDir.fromLerp( tar.twist, tar.altTwist, t ).norm(); // Target Twist Direction
        dir.fromQuat( sRot, lnk.axes.twist );       // Get bone's ws bound twist dir
        tRot
            .fromSwing( dir, tDir )                 // Create twisting rotation
            .mul( sRot )                            // Add twist to swing
            .pmulInvert( ptran.rot );               // To Local Space

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        pose.setLocalRot( lnk.index, tRot );        // Save to pose
    }
}