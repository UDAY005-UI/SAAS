export function calculateInstructorAmount(
    coursePrice: number,
    commissionPercent: number
) {
    return coursePrice * (1 - commissionPercent / 100);
}
