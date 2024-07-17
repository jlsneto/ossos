// #region IMPORTS
import type { IKChain, IKLink } from '../IKChain';
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';

import Vec3             from '../../maths/Vec3';
import Quat             from '../../maths/Quat';
import Transform        from '../../maths/Transform';
// #endregion


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function trapezoidSolver( tar: IKTarget, chain: IKChain, pose: Pose, _debug: any ){
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    const ptran = new Transform(); // Parent Bone WS Transform
    const ctran = new Transform(); // Current Bone WS Transform
    let lnk : IKLink;

    // Axis of rotation after LookSolver aligns chain to target
    const axis  = new Vec3().fromCross( tar.twist, tar.swing ).norm();
    const rot   = new Quat();

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //       Short Side
    //    b  /---------\ c
    //      /           \
    //   a /_____________\ d
    //        Long Side

    const lft_len   = chain.links[0].len;
    const top_len   = chain.links[1].len;
    const rit_len   = chain.links[2].len;
    const bot_len   = tar.dist;
    let ang         : Array< number > | null;

    // NOTE : If bot + top are = calc fails, But if they're equal,
    // then it makes a rect with all angles being 90 Degrees
    // so if it becomes an issue thats a way to fix it. Might also have to
    // check that bone 0 and 2 are equal lengths for the 90 degree fix.
    // But things do work if legs are not the same length. The shortest bone will
    // determine how fast the trapezoid collapses not sure how to compute that
    // yet other then letting the calculator give back null when the dimensions aren't possible.
    if( bot_len >= top_len ){
        ang = trapezoidCalculator( bot_len, top_len, lft_len, rit_len ); // IK distance longer then middle bone
        if( !ang ) return;
    }else{
        ang = trapezoidCalculator( top_len, bot_len, rit_len, lft_len ); // Middle bone is longer then ik distance
        if( !ang ) return;

        // Since we need to do the computation in reverse to make sure the shortest base it top, longest is bottom
        // Changing the top/bottom changes the order that the rotation values come back.
        // Easy to fix by reordering the array to match what it would be if the IK line is the longer one
        ang = [ ang[ 2 ], ang[ 3 ], ang[ 0 ], ang[ 1 ] ]; // abcd -> cdab
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // FIRST BONE

    // Get Bone's current rotation
    lnk = chain.links[0];
    pose.getWorldTransform( lnk.pindex, ptran );

    // Link's bind isn't really needed, but to ease typescript "error",
    // I need a backup transform because getBone is able to return a null.
    // But the first bone must use the results of the looksolver instead of bind
    ctran.fromMul( ptran, pose.getBone( lnk.index )?.local ?? lnk.bind );

    rot
        .fromAxisAngle( axis, -ang[0] ) // Create opposite direction rotation
        .mul( ctran.rot )               // Apply to current rotation
        .pmulInvert( ptran.rot );       // To Local Space

    pose.setLocalRot( lnk.index, rot );

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SECOND BONE - REPEAT OF BONE 1
    lnk = chain.links[1];
    pose.getWorldTransform( lnk.pindex, ptran );
    ctran.fromMul( ptran, lnk.bind );   // Use bind here instead of pose

    rot
        .fromAxisAngle( axis, -( Math.PI + ang[1] ) ) // This time needed to be over 180deg to rotate correctly
        .mul( ctran.rot )
        .pmulInvert( ptran.rot );

    pose.setLocalRot( lnk.index, rot );

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // THIRD BONE - REPEAT OF BONE 1

    lnk = chain.links[2];
    pose.getWorldTransform( lnk.pindex, ptran );
    ctran.fromMul( ptran, lnk.bind );

    rot
        .fromAxisAngle( axis, -( Math.PI + ang[2] ) )
        .mul( ctran.rot )
        .pmulInvert( ptran.rot );

    pose.setLocalRot( lnk.index, rot );
}

// http://www.1728.org/quadtrap.htm
function trapezoidCalculator( lbase: number, sbase: number, lleg: number, rleg: number ): Array<number> | null{
    if( lbase < sbase ){ console.log( 'Long Base Must Be Greater Than Short Base' ); return null; };

    // h2= (a+b-c+d)(-a+b+c+d)(a-b-c+d)(a+b-c-d)/(4(a-c))^2
    let h2 = ( lbase + lleg + sbase + rleg ) *
             ( lbase * -1 + lleg + sbase + rleg ) *
             ( lbase - lleg - sbase + rleg ) *
             ( lbase + lleg - sbase - rleg ) /
             ( 4 * ( ( lbase-sbase ) * ( lbase-sbase ) ) );

    if( h2 < 0 ){ console.log( 'A Trapezoid With These Dimensions Cannot Exist' ); return null; };

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // let perim   = lbase + sbase + lleg + rleg;
    // let median  = ( lbase + sbase ) * 0.5;
    let diff    = lbase - sbase;
    let xval    = ( lleg**2 + diff**2 - rleg**2 ) / ( 2 * diff );
    let height  = Math.sqrt( lleg**2 - xval**2 );
    // let area    = height * median;
    let adj     = diff - xval;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    let angA = Math.atan( height / xval );  // Angle of LBase + LLeg
    if( angA < 0 ) angA = angA + Math.PI;

    let angB = Math.PI - angA;              // Angle of SBase + LLeg

    let angD = Math.atan( height / adj );   // Angle of LBase + RLeg
    if( angD < 0 ) angD = angD + Math.PI;

    let angC = Math.PI - angD;              // Angle of SBase + RLeg

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // let diag1 = ( lbase-xval ) * ( lbase-xval ) + ( height*height ); // bottom left to top right length
    // diag1 = Math.sqrt( diag1 );
    // let diag2 = ( sbase + xval ) * ( sbase + xval ) + (height*height); // bottom right to top left length
    // diag2 = Math.sqrt( diag2 );

    return [ angA, angB, angC, angD ];
}
