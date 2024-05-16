// #region IMPORTS
import type { IKChain }     from './IKChain';
import type Pose            from '../armature/Pose';

import Vec3, { ConstVec3 }  from '../maths/Vec3';
import Transform            from '../maths/Transform';
// #endregion


export default class IKTarget{
    // #region MAIN
    hasChanged  = false;
    tMode       = 0;               // Initial Target : Position or Direction
    pMode       = 0;               // Initial Pole   : Position or Direction
    dist        = 0;
    endPos      = new Vec3();      // Target Position
    startPos    = new Vec3();      // Origin Position
    polePos     = new Vec3();      // Position of Pole
    swing       = new Vec3();      // To Target Direction or end-start position
    twist       = new Vec3();      // To Pole Direction or Orth direction of swing

    pworld      = new Transform(); // Parent Bone WS Transform
    rworld      = new Transform(); // Root Bone WS Transform
    // #endregion

    // #region SETTERS
    setPositions( t: ConstVec3, p ?: ConstVec3 ): this{
        this.hasChanged = true;
        this.tMode      = 0;
        this.pMode      = 0;
        this.endPos.copy( t );

        if( p ) this.polePos.copy( p );
        return this;
    }

    setDirections( s: ConstVec3, t ?: ConstVec3 ): this{
        this.hasChanged = true;
        this.tMode      = 1;
        this.pMode      = 0;
        this.swing.copy( s );

        if( t ) this.twist.copy( t );
        return this;
    }

    setPoleDir( p: ConstVec3 ): this{
        this.hasChanged = true;
        this.pMode      = 1;
        this.twist.copy( p );
        return this;
    }
    // #endregion

    // #region METHODS
    resolveTarget( chain: IKChain, pose: Pose ): this{
        // Get the World transform to the root's parent bone of the chain
        pose.getWorldTransform( chain.links[0].pindex, this.pworld );
        
        // Then add bone's LS bind transform to get its current unmodified world transform
        this.rworld.fromMul( this.pworld, chain.links[ 0 ].bind );

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Determine the Target position in relation to chain's root
        switch( this.tMode ){
            // Position
            case 0:
                this.startPos.copy( this.rworld.pos );              // Chain Root
                this.swing.fromSub( this.endPos, this.startPos );   // TargetPos - ChainRootPos

                this.dist = this.swing.len;                         // Distance from Root to Target
                this.swing.norm();                                  // Normalize Swing Direction
                break;

            // Direction
            case 1: 
                console.log( 'tMode 1 not implemented' );
                break;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Determine the Target pole in relation to chain's root

        // TODO, Need to handle when Pole Matches Direction
        switch( this.pMode ){
            // Position
            case 0:
                console.log( 'pMode 0 not implemented' );
                // this.twist
                //         .fromSub( this.polePos, this.startPos )
                //         .alignTwist( this.swing, this.twist );
                break;

            // Direction
            case 1: this.twist.alignTwist( this.swing, this.twist ).norm(); break;
        }

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.hasChanged = false;
        return this;
    }
    // #endregion

    // #region HELPERS
    debug( d: any ): this{
        d.pnt.add( this.startPos, 0xffffff, 3, 0 );
        d.pnt.add( this.endPos, 0xffffff, 3, 1 );
        d.ln.add( this.startPos, this.endPos, 0xffffff );

        const p = this.twist.clone().scale( 0.5 ).add( this.startPos );
        d.ln.add( this.startPos, p, 0xffffff );
        d.pnt.add( p, 0xffffff, 3, 6 );
        return this;
    }
    // #endregion
}


// The reset direction will change depending on the pole.
// const dot = Vec3.dot( toTar, Vec3.UP );
// let resetDir;
// if( dot >= 0.9999 )         resetDir = Vec3.BACK;       // Pointing Up
// else if( dot <= -0.9999)    resetDir = Vec3.FORWARD;    // Pointing Down
// else                        resetDir = Vec3.UP;         // Not pointing at a pole

// Another code sample of fixing directions twist+swing directions matching
// const dot = Vec3.dot( twistDir, tarDir );
// if( Math.abs( dot ) > 0.9999 ){
//     // Compute rotation axis to spin the Z direction
//     // Can use X since its orthogonal to Y & Z already
//     orthDir.fromQuat( cTran.rot, chain.axes.x );

//     // Spin the twist direction 90 degrees based on the sign of the dot product
//     // So if positive spin downward else spin upward.
//     twistDir.transformQuat(
//         Quat.axisAngle( orthDir, Math.PI * 0.5 * Math.sign( dot ) )
//     );
// }