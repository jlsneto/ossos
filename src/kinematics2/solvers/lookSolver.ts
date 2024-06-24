// #region IMPORTS
import type { IKChain } from '../IKChain';
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';

import Vec3             from '../../maths/Vec3';
import Quat             from '../../maths/Quat';
// #endregion

export default function lookSolver( tar: IKTarget, chain: IKChain, pose: Pose, Debug ?: any ): void{
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // NOTE: A resolved target should have the WS transform of the root
    // bone and its parent. No need to recompute a common bit of info
    // in the solver itself anymore.
    const lnk = chain.links[0];

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Swing Rotation
    const axes = lnk.axes.getFromQuat( tar.rworld.rot ); // Get axes qi directions of the root bone
    const rot  = new Quat()
        .fromSwing( axes.swing, tar.swing )              // Create Swing Rotation
        .mul( tar.rworld.rot );                          // Apply swing to current bone rotation

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Twist Rotation
    const twistDir  = new Vec3().fromQuat( rot, lnk.axes.twist );

    if( Vec3.dot( tar.twist, twistDir ) < 0.999 ){
        const twistReset = new Quat().fromSwing( twistDir, tar.twist );

        if( Vec3.dot( twistReset, rot ) < 0 ) twistReset.negate();

        rot.pmul( twistReset );
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Finalize
    rot.pmulInvert( tar.pworld.rot );   // Localspace
    pose.setLocalRot( lnk.index, rot ); // Save to pose

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if( Debug ){
        Debug.ln.add( tar.startPos, new Vec3().fromAdd( twistDir, tar.startPos ), 0x00ff00 );
        Debug.ln.add( tar.startPos, new Vec3().fromAdd( tar.twist, tar.startPos ), 0xffffff );
        Debug.ln.add( tar.startPos, tar.endPos, 0xffffff );
    }
}


/* NOTE: OLD SOLVER CODE for fixing things when twist direction matches the target direction
So far the new code this was not really needed with how things have been changed. Keep
this bit of code around just incase in the future of an edge case that'll need it

// Correct twist direction by rotating it if it matches the swing point direction
// Swing dir should now match target dir, so we can reuse that for our dot check
const dot = Vec3.dot( twistDir, tarDir );
if( Math.abs( dot ) > 0.9999 ){
    // Compute rotation axis to spin the Z direction
    // Can use X since its orthogonal to Y & Z already
    orthDir.fromQuat( cTran.rot, chain.axes.x );

    // Spin the twist direction 90 degrees based on the sign of the dot product
    // So if positive spin downward else spin upward.
    twistDir.transformQuat(
        Quat.axisAngle( orthDir, Math.PI * 0.5 * Math.sign( dot ) )
    );
}
*/